import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService, ChatMessage, ChatResponse } from './chat.service';

@ApiTags('chat')
@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a chat message' })
  async chat(@Body() body: { messages: ChatMessage[] }): Promise<ChatResponse> {
    return this.chatService.chat(body.messages);
  }
}
