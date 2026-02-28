"use server";

import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import { supabase } from '@/core/lib/supabase';
import { TriggerAnalysisSchema, TriggerAnalysisInput } from '@/core/lib/validation';

/**
 * Triggers the Python analysis orchestrator.
 * This runs in the background and updates Supabase directly.
 * 
 * Path construction uses env vars and string ops to prevent
 * Turbopack from statically tracing the intelligence/venv symlinks.
 */
export async function triggerAnalysisAction(params: TriggerAnalysisInput) {
    try {
        // Validate inputs
        const validatedParams = TriggerAnalysisSchema.parse(params);

        // Build paths at runtime only — prevents Turbopack from 
        // following the venv symlink during build-time module resolution
        const cwd = process.cwd();
        const sep = '/';
        const pythonRoot = `${cwd}${sep}intelligence`;
        const scriptPath = `${pythonRoot}${sep}main.py`;
        const venvPython = `${pythonRoot}${sep}venv${sep}bin${sep}python3`;

        // Prepare JSON input
        const jsonInput = JSON.stringify(validatedParams);

        console.log(`[*] Triggering Python analysis for: ${params.url}`);
        console.log(`    CWD: ${pythonRoot}`);

        // --- HACK EXTREMO PARA O NIXPACKS / EASYPANEL ---
        // O Easypanel deleta qualquer coisa que instalamos na máquina de Build
        // Então instalamos em tempo real na máquina efêmera toda vez que o botão é clicado!
        try {
            console.log(`[*] Instalando dependências de IA "On-The-Fly" no container ativo...`);
            const onTheFlyPip = spawnSync('python3', [
                '-m', 'pip', 'install', '-r', 'requirements.txt', '--break-system-packages'
            ], {
                cwd: pythonRoot,
                encoding: 'utf-8',
                stdio: 'inherit' // Permite ver o output nos logs
            });
            console.log(`[*] Pip on-the-fly terminou.`);
        } catch (e) {
            console.log(`[!] Falha no Hack do PIP On-The-Fly:`, e);
        }
        // ------------------------------------------------

        // Log python properties on server environment before execution
        try {
            console.log(`[V] node process.cwd():`, process.cwd());
            const pythonPath = spawnSync('which', ['python3'], { encoding: 'utf-8' });
            console.log(`[V] which python3:`, pythonPath.stdout.trim());
            const pipFreeze = spawnSync('python3', ['-m', 'pip', 'freeze'], { encoding: 'utf-8' });
            console.log(`[V] pip freeze packages:`, pipFreeze.stdout.slice(0, 100).replace(/\n/g, ', '));
        } catch (e) {
            console.log(`[V] Failed to check python paths`, e);
        }

        // Nixpacks implementation relies on an explicitly built venv at /app/venv
        let execPython = '/app/venv/bin/python3';
        if (!fs.existsSync(execPython)) {
            console.log(`[!] Venv path not found at ${execPython}, trying relative venv...`);
            const fallback = `${pythonRoot}/venv/bin/python3`;
            execPython = fs.existsSync(fallback) ? fallback : 'python3';
            console.log(`[!] Switching to fallback execution: ${execPython}`);
        }

        // Spawn process
        const pythonProcess = spawn(execPython, [scriptPath, jsonInput], {
            cwd: pythonRoot,
            env: { ...process.env, PYTHONPATH: pythonRoot }
        });

        // We don't wait for it to finish (background task)
        // Python will update Supabase once done

        let pythonStderr = '';

        pythonProcess.stdout.on('data', (data) => {
            console.log(`[Python STDOUT]: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`[Python STDERR]: ${data}`);
            pythonStderr += data.toString();
        });

        pythonProcess.on('error', (err) => {
            console.error(`[Python Spwan Error]: FAILED TO START PYTHON PROCESS:`, err);
            // Inform supabase about the failure since python won't run to do it
            supabase.from('diagnostics').update({
                status: 'failed',
                report_data: { error: `Python Engine Failed to Boot: ${err.message}` }
            }).eq('id', validatedParams.diagnosticId).then(() => console.log('Updated supabase with boot failure'));
        });

        pythonProcess.on('close', (code) => {
            console.log(`[Python] Finalizado com código: ${code}`);
            if (code !== 0) {
                // Update status on crash
                supabase.from('diagnostics').update({
                    status: 'failed',
                    report_data: { error: `Python Process crashed with exit code ${code}. Stderr: ${pythonStderr}` }
                }).eq('id', validatedParams.diagnosticId).then(() => console.log('Updated supabase with crash status'));
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error triggering analysis:', error);
        return { success: false, error: error.message };
    }
}
