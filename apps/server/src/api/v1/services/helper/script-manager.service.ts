import path from 'path';
import { logger } from '#/common/utils/logger.util';
import { exec, spawn } from 'child_process';
import ct from '#/common/constants';

interface RunScriptParams {
  sessionId: string;
  scriptName: string;
  country: string;
  operator: string;
}

class ScriptManager {
  private buildScriptPath(scriptName: string): string {
    return path.join(ct.files.rootPath, ct.files.uploadPath, scriptName);
  }

  async run({ sessionId, scriptName, country, operator }: RunScriptParams) {
    const scriptPath = this.buildScriptPath(scriptName);

    const child = spawn('screen', [
      '-dmS',
      sessionId,
      'python3',
      scriptPath,
      '--country',
      country,
      '--operator',
      operator,
    ]);

    // Collect and log real-time stats (adjust output handling as needed)
    child.stdout.on('data', (data) => {
      const output = data.toString().trim();
      logger.info(`Session ${sessionId} stdout: ${output}`);
      // Parse the output if structured and store it in your database
    });

    child.stderr.on('data', (data) => {
      const errorOutput = data.toString().trim();
      logger.error(`Session ${sessionId} stderr: ${errorOutput}`);
    });

    child.on('close', (code) => {
      logger.info(`Session ${sessionId} exited with code ${code}`);
    });
  }

  async stop(sessionId: string) {
    exec(`screen -X -S ${sessionId} quit`, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Error stopping session ${sessionId}: ${error.message}`);
        return;
      }
      logger.info(`Session ${sessionId} stopped successfully`);
    });
  }

  async restart({ sessionId, scriptName, country, operator }: RunScriptParams) {
    await this.stop(sessionId);
    // Wait a moment before restarting to ensure resources are freed
    setTimeout(() => {
      this.run({ sessionId, scriptName, country, operator });
    }, 1000);
  }

  async killAll() {
    exec(
      "screen -ls | grep Detached | cut -d. -f1 | awk '{print $1}' | xargs -r kill",
      (error, stdout, stderr) => {
        if (error) {
          logger.error(`Error killing all sessions: ${error.message}`);
          return;
        }
        logger.info('All detached screen sessions killed');
      },
    );
  }

  async kill(sessionId: string) {
    exec(`screen -X -S ${sessionId} quit`, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Error killing session ${sessionId}: ${error.message}`);
        return;
      }
      logger.info(`Session ${sessionId} killed successfully`);
    });
  }
}

const scriptManager = new ScriptManager();
export default scriptManager;
