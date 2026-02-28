"use server";

import { spawn } from 'child_process';
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
        console.log(`    Expected Python: ${venvPython}`);

        let execPython = venvPython;

        if (!fs.existsSync(venvPython)) {
            console.log(`[!] Venv Python not found at ${venvPython}, falling back to system python3`);
            execPython = 'python3';
        }

        // Spawn process
        const pythonProcess = spawn(execPython, [scriptPath, jsonInput], {
            cwd: pythonRoot,
            env: { ...process.env, PYTHONPATH: pythonRoot }
        });

        // We don't wait for it to finish (background task)
        // Python will update Supabase once done

        pythonProcess.stdout.on('data', (data) => {
            console.log(`[Python STDOUT]: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`[Python STDERR]: ${data}`);
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
                    report_data: { error: `Python Process crashed with exit code ${code}` }
                }).eq('id', validatedParams.diagnosticId).then(() => console.log('Updated supabase with crash status'));
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error triggering analysis:', error);
        return { success: false, error: error.message };
    }
}
