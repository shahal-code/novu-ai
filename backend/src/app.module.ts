import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { validateConfig } from '@infrastructure/config/env.schema';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { SharedModule } from '@shared/shared.module';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { GlobalExceptionFilter } from '@shared/filters/global-exception.filter';
import { LoggingInterceptor } from '@shared/interceptors/logging.interceptor';

import { AppController } from './app.controller';
import { AuthModule } from '@modules/auth/auth.module';
import { ConversationsModule } from '@modules/conversations/conversations.module';
import { MemoryModule } from '@modules/memory/memory.module';
import { ChatModule } from '@modules/chat/chat.module';
import { DocumentsModule } from '@modules/documents/documents.module';
import { ImageModule } from '@modules/image/image.module';
import { ExecuteModule } from '@modules/execute/execute.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
    }),
    DatabaseModule,
    SharedModule,
    AuthModule,
    ConversationsModule,
    MemoryModule,
    ChatModule,
    DocumentsModule,
    ImageModule,
    ExecuteModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
