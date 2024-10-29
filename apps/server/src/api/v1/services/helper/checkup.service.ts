import { HealthDTO } from '#/api/v1/entities/dtos/health.dto';
import { StatusCode } from '#/api/v1/entities/enums/error.enums';
import ct from '#/common/constants';
import { getErrorMessage } from '#/common/utils/error-extras.util';
import { logger } from '#/common/utils/logger.util';
import axios from 'axios';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import redisService from './redis.service';
import mongoClient from '#/common/db/mongodb/mongo.client';
import prisma from '#/common/db/prisma/prisma.client';

const execAsync = promisify(exec);

class CheckupService {
  async httpCheck(url: string): Promise<HealthDTO.CheckResult> {
    const startTime = Date.now();
    const response = await axios.get(url); // perform a http check using axios
    const endTime = Date.now();

    if (response.status === StatusCode.OK) {
      return {
        success: true,
        message: `HTTP check successful at url: ${url}`,
        info: {
          response: {
            time: `${endTime - startTime}ms`,
            statusCode: StatusCode.OK,
          },
        },
      };
    } else {
      return {
        success: false,
        message: 'HTTP check failed',
      };
    }
  }

  async dbCheck(): Promise<HealthDTO.CheckResult> {
    const checks = await Promise.allSettled([
      this.checkPrisma(),
      this.checkRedis(),
      this.checkMongo(),
    ]);

    const [prismaResult, redisResult, mongoResult] = checks;

    const allSuccessful = checks.every((check) => check.status === 'fulfilled');

    return {
      success: allSuccessful,
      message: allSuccessful
        ? 'All database connections are healthy'
        : 'One or more database connections failed',
      info: {
        prisma: this.getCheckStatus(prismaResult),
        redis: this.getCheckStatus(redisResult),
        mongodb: this.getCheckStatus(mongoResult),
      },
      errors: this.collectErrors(checks),
    };
  }

  private async checkPrisma(): Promise<void> {
    // Instead of connecting/disconnecting, just run a simple query
    await prisma.$queryRaw`SELECT 1`;
  }

  private async checkRedis(): Promise<void> {
    await redisService.ping();
  }

  private async checkMongo(): Promise<void> {
    await mongoClient.ping();
  }

  private getCheckStatus(result: PromiseSettledResult<void>): boolean | string {
    return result.status === 'fulfilled';
  }

  private collectErrors(
    checks: PromiseSettledResult<void>[],
  ): string | undefined {
    const errors = checks
      .filter(
        (check): check is PromiseRejectedResult => check.status === 'rejected',
      )
      .map((check) => getErrorMessage(check.reason))
      .join('; ');

    return errors.length > 0 ? errors : undefined;
  }

  async diskCheck(): Promise<HealthDTO.CheckResult> {
    try {
      // Execute the 'df' command to check disk space usage
      // '-h' option is for human-readable format
      const { stdout } = await execAsync('df -h /'); // Check root partition, adjust as needed
      const lines = stdout.split('\n');
      const data = lines[1].split(/\s+/); // Assuming the second line contains the disk info
      const usedPercentage = parseInt(data[4], 10); // Assuming the fifth column is the used percentage
      const totalSpace = data[1]; // Assuming the second column is the total space
      const usedSpace = data[2]; // Assuming the third column is the used space
      const availableSpace = data[3]; // Assuming the fourth column is the available space;

      if (usedPercentage < ct.checkup.disk.warningThreshold) {
        return {
          success: true,
          message: `Disk check successful. Usage: ${usedPercentage}%.`,
          info: {
            total: totalSpace,
            used: usedSpace,
            available: availableSpace,
          },
        };
      } else if (usedPercentage < ct.checkup.disk.criticalThreshold) {
        return {
          success: true,
          warn: true,
          message: `Disk check warning: Usage exceeds ${ct.checkup.disk.warningThreshold}%. Usage: ${usedPercentage}%.`,
          info: {
            total: totalSpace,
            used: usedSpace,
            available: availableSpace,
          },
        };
      } else {
        return {
          success: false,
          message: `Disk check warning: Usage exceeds ${ct.checkup.disk.criticalThreshold}%. Usage: ${usedPercentage}%.`,
          info: {
            total: totalSpace,
            used: usedSpace,
            available: availableSpace,
          },
        };
      }
    } catch (error) {
      logger.error('Disk check failed: ' + chalk.red(error));

      return {
        success: false,
        message: 'Disk check failed!',
      };
    }
  }

  async memoryCheck(): Promise<HealthDTO.CheckResult> {
    try {
      // Execute the 'free' command to check memory usage
      // '-m' option is for megabytes
      const { stdout } = await execAsync('free -m');
      const lines = stdout.split('\n');
      const memoryLine = lines[1].split(/\s+/); // Assuming the second line contains the memory info
      const totalMemory = memoryLine[1]; // Total memory in MB
      const usedMemory = memoryLine[2]; // Used memory in MB
      const availableMemory = memoryLine[3]; // Available memory in MB
      const usedPercentage =
        (parseInt(usedMemory) / parseInt(totalMemory)) * 100;

      if (usedPercentage < ct.checkup.memory.warningThreshold) {
        return {
          success: true,
          message: `Memory check successful. Usage: ${usedPercentage.toFixed(2)}%.`,
          info: {
            total: `${totalMemory} MB`,
            used: `${usedMemory} MB`,
            available: `${availableMemory} MB`,
          },
        };
      } else if (usedPercentage < ct.checkup.memory.criticalThreshold) {
        return {
          success: true,
          warn: true,
          message: `Memory check warning: Usage exceeds ${ct.checkup.memory.warningThreshold}%. Usage: ${usedPercentage.toFixed(2)}%.`,
          info: {
            total: `${totalMemory} MB`,
            used: `${usedMemory} MB`,
            available: `${availableMemory} MB`,
          },
        };
      } else {
        return {
          success: false,
          message: `Memory check warning: Usage exceeds ${ct.checkup.memory.criticalThreshold}%. Usage: ${usedPercentage.toFixed(2)}%.`,
          info: {
            total: `${totalMemory} MB`,
            used: `${usedMemory} MB`,
            available: `${availableMemory} MB`,
          },
        };
      }
    } catch (error) {
      logger.error('Memory check failed: ' + chalk.red(error));

      return {
        success: false,
        message: 'Memory check failed!',
      };
    }
  }
}

const checkupService = new CheckupService();
export default checkupService;
