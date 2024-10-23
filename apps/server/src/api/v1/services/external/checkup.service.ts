import { HealthDTO } from '#/api/v1/entities/dtos/health.dto';
import { StatusCode } from '#/api/v1/entities/enums/error.enums';
import ct from '#/common/constants';
import { asyncFnWrapper } from '#/common/utils/async-errors.util';
import { getErrorMessage } from '#/common/utils/error-extras.util';
import { logger } from '#/common/utils/logger.util';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { redisService } from './redis.service';

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
    const prisma = new PrismaClient();

    let prismaWorking = true;
    let redisWorking = true;

    try {
      await prisma.$connect();
      await prisma.$disconnect();
    } catch (error) {
      logger.error(
        'Database check failed: ' + chalk.red(getErrorMessage(error)),
      );

      prismaWorking = false;

      return {
        success: false,
        message: `Prisma Database connection failed!`,
        errors: `${getErrorMessage(error)}`,
        info: {
          prisma: prismaWorking,
          redis: 'Not checked',
        },
      };
    }

    try {
      await redisService.set('x', 'y');
      await redisService.del(['x']);
    } catch (error) {
      logger.error('Redis check failed: ' + chalk.red(getErrorMessage(error)));

      redisWorking = false;

      return {
        success: false,
        message: `Redis connection failed!`,
        errors: `${getErrorMessage(error)}`,
        info: {
          prisma: prismaWorking,
          redis: redisWorking,
        },
      };
    }

    return {
      success: true,
      message:
        'Database connection successful. All Databases are up and running!',
      info: {
        prisma: prismaWorking,
        redis: redisWorking,
      },
    };
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
