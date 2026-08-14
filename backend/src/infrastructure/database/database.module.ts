import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { User, UserSchema } from './schemas/user.schema';
import { EmailOtp, EmailOtpSchema } from './schemas/email-otp.schema';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { Memory, MemorySchema } from './schemas/memory.schema';

import { MongooseUserRepository } from '../repositories/mongoose-user.repository';
import { MongooseEmailOtpRepository } from '../repositories/mongoose-email-otp.repository';
import { MongooseConversationRepository } from '../repositories/mongoose-conversation.repository';
import { MongooseMessageRepository } from '../repositories/mongoose-message.repository';
import { MongooseMemoryRepository } from '../repositories/mongoose-memory.repository';

import { USER_REPOSITORY } from '@domain/repositories/user.repository.interface';
import { EMAIL_OTP_REPOSITORY } from '@domain/repositories/email-otp.repository.interface';
import { CONVERSATION_REPOSITORY } from '@domain/repositories/conversation.repository.interface';
import { MESSAGE_REPOSITORY } from '@domain/repositories/message.repository.interface';
import { MEMORY_REPOSITORY } from '@domain/repositories/memory.repository.interface';

const repositories = [
  { provide: USER_REPOSITORY, useClass: MongooseUserRepository },
  { provide: EMAIL_OTP_REPOSITORY, useClass: MongooseEmailOtpRepository },
  { provide: CONVERSATION_REPOSITORY, useClass: MongooseConversationRepository },
  { provide: MESSAGE_REPOSITORY, useClass: MongooseMessageRepository },
  { provide: MEMORY_REPOSITORY, useClass: MongooseMemoryRepository },
];

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EmailOtp.name, schema: EmailOtpSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Memory.name, schema: MemorySchema },
    ]),
  ],
  providers: [...repositories],
  exports: [MongooseModule, ...repositories],
})
export class DatabaseModule {}
