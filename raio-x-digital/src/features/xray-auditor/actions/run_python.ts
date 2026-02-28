"use server";

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

export interface PythonReport {
    id?: string;
    target_url: string;
    company_name?: string;
    scan_timestamp: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    skills_results: any[];
}

export interface PredatorParams {
    url: string;
    companyName: string;
    city: string;
    instagram: string;
    selectedAgents?: string[];
}

export async function runPythonOrchestrator(params: PredatorParams): Promise<PythonReport> {
    try {
        // Definimos o path absoluto para a pasta do agente Python
        // No ambiente local, assumimos que 'performance_agent' está um nível acima da pasta do next
        const agentDir = path.resolve(process.cwd(), "python_agent");

        // Comando para ativar o venv e rodar o main.py
        // Usamos o python3 direto do venv para garantir que as libs estejam lá
        const venvPython = path.join(agentDir, "venv", "bin", "python3");
        const mainScript = path.join(agentDir, "main.py");

        // Executa e aguarda
        console.log(`Executando Python Orquestrador para: ${params.companyName}`);

        // Limpar arquivo anterior se existir
        const reportPath = path.join(agentDir, "predator_report.json");
        try {
            await fs.unlink(reportPath);
        } catch (e) {
            // Ignora se não existir
        }

        // Serializa os dados em JSON e remove aspas simples problemáticas no shell escapando
        const jsonPayload = JSON.stringify(params).replace(/'/g, "'\\''");

        const { stdout, stderr } = await execAsync(`"${venvPython}" "${mainScript}" '${jsonPayload}'`, {
            cwd: agentDir,
            maxBuffer: 1024 * 1024 * 10, // Aumenta limite de stdout para 10MB
            timeout: 900000 // 15 minutos de timeout para suportar os agentes de IA mais lentos
        });

        console.log("Python STDOUT:", stdout);
        if (stderr) console.error("Python STDERR:", stderr);

        // Agora lemos o JSON gerado
        const data = await fs.readFile(reportPath, "utf-8");
        return JSON.parse(data) as PythonReport;

    } catch (error) {
        console.error("Erro fatal ao rodar integração Python:", error);
        throw new Error("Falha na varredura profunda (Python Engine Error).");
    }
}
