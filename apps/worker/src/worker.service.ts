import { Injectable, Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
@Processor('email')
@Processor('notification')
@Processor('background-tasks')
export class WorkerService {
  private readonly logger = new Logger(WorkerService.name);

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
    @InjectQueue('background-tasks') private tasksQueue: Queue,
  ) {}

  @Process('send-email')
  async processEmailJob(job: Job) {
    this.logger.log(`Processing email job: ${job.id}`);
    try {
      const { email, subject, template } = job.data;
      this.logger.log(`Sending email to ${email} with subject: ${subject}`);
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate delay
      return { success: true, email, subject };
    } catch (error) {
      this.logger.error(`Email job failed: ${error.message}`);
      throw error;
    }
  }

  @Process('send-notification')
  async processNotificationJob(job: Job) {
    this.logger.log(`Processing notification job: ${job.id}`);
    try {
      const { userId, message } = job.data;
      this.logger.log(`Sending notification to user ${userId}: ${message}`);
      // Simulate notification sending
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true, userId, message };
    } catch (error) {
      this.logger.error(`Notification job failed: ${error.message}`);
      throw error;
    }
  }

  @Process('execute-task')
  async processBackgroundTask(job: Job) {
    this.logger.log(`Processing background task: ${job.id}`);
    try {
      const { taskName, data } = job.data;
      this.logger.log(`Executing task ${taskName}`);
      // Simulate task execution
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, taskName, processedData: data };
    } catch (error) {
      this.logger.error(`Background task failed: ${error.message}`);
      throw error;
    }
  }


  async addEmailJob(
    email: string,
    subject: string,
    template: string,
    data?: any,
  ) {
    const job = await this.emailQueue.add(
      'send-email',
      {
        email,
        subject,
        template,
        ...data,
      },
      {
        attempts: 3,  // số lần thử lại nếu thất bại
        backoff: { type: 'exponential', delay: 2000 }, // thời gian chờ giữa các lần thử lại: tăng dần
        removeOnComplete: true, // xóa job khỏi queue khi hoàn thành
      },
    );
    return job;
  }

  async addNotificationJob(userId: string, message: string, data?: any) {
    const job = await this.notificationQueue.add(
      'send-notification',
      {
        userId,
        message,
        ...data,
      },
      {
        attempts: 2,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      },
    );
    return job;
  }

  async addBackgroundTask(taskName: string, data: any) {
    const job = await this.tasksQueue.add(
      'execute-task',
      {
        taskName,
        data,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
      },
    );
    return job;
  }

  async getQueueStats() {
    const emailStats = await this.emailQueue.getJobCounts();
    const notificationStats = await this.notificationQueue.getJobCounts();
    const tasksStats = await this.tasksQueue.getJobCounts();

    return {
      email: emailStats,
      notification: notificationStats,
      backgroundTasks: tasksStats,
    };
  }

  getHealth(): string {
    return 'Worker service is running';
  }
}
