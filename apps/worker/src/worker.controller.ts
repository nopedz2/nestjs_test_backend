import { Controller, Get, Post, Body } from '@nestjs/common';
import { WorkerService } from './worker.service';

@Controller('worker')
export class WorkerController {
  [x: string]: any; // to fix lint error
  constructor(private readonly workerService: WorkerService) {}

  @Get('health')
  getHealth(): string {
    return this.workerService.getHealth();
  }

  @Get('stats')
  async getQueueStats() {
    return this.workerService.getQueueStats();
  }

  @Post('email')
  async addEmailJob(
    @Body()
    data: {
      email: string;
      subject: string;
      template: string;
      additionalData?: any;
    },
  ) {
    const job = await this.workerService.addEmailJob(
      data.email,
      data.subject,
      data.template,
      data.additionalData,
    );
    return {
      success: true,
      message: 'Email job added to queue',
      jobId: job.id,
    };
  }

  @Post('notification')
  async addNotificationJob(
    @Body() data: { userId: string; message: string; additionalData?: any },
  ) {
    const job = await this.workerService.addNotificationJob(
      data.userId,
      data.message,
      data.additionalData,
    );
    return {
      success: true,
      message: 'Notification job added to queue',
      jobId: job.id,
    };
  }

  @Post('background-task')
  async addBackgroundTask(
    @Body() data: { taskName: string; payload: any },
  ) {
    const job = await this.workerService.addBackgroundTask(
      data.taskName,
      data.payload,
    );
    return {
      success: true,
      message: 'Background task added to queue',
      jobId: job.id,
    };
  }
}
