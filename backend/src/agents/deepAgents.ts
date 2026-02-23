import axios from 'axios';
import { Settings, PlanStep, Message } from '../types.js';

export class DeepAgentsService {
  private settings: Settings;
  private preferredProvider: string;

  constructor(settings: Settings, preferredProvider?: string) {
    this.settings = settings;
    this.preferredProvider = preferredProvider || 'anthropic';
  }

  private getActiveProvider() {
    const providerConfig = this.preferredProvider;
    
    console.log('getActiveProvider - preferredProvider:', providerConfig);
    console.log('getActiveProvider - settings:', JSON.stringify(this.settings));
    
    if (providerConfig === 'anthropic' && this.settings.anthropic.apiKey) {
      console.log('Using anthropic');
      return { provider: 'anthropic', ...this.settings.anthropic };
    }
    if (providerConfig === 'openai' && this.settings.openai.apiKey) {
      console.log('Using openai');
      return { provider: 'openai', ...this.settings.openai };
    }
    if (providerConfig === 'openrouter' && this.settings.openrouter.apiKey) {
      console.log('Using openrouter');
      return { provider: 'openrouter', ...this.settings.openrouter };
    }
    
    if (this.settings.anthropic.apiKey) {
      console.log('Fallback: Using anthropic');
      return { provider: 'anthropic', ...this.settings.anthropic };
    }
    if (this.settings.openai.apiKey) {
      console.log('Fallback: Using openai');
      return { provider: 'openai', ...this.settings.openai };
    }
    if (this.settings.openrouter.apiKey) {
      console.log('Fallback: Using openrouter');
      return { provider: 'openrouter', ...this.settings.openrouter };
    }
    throw new Error('No LLM provider configured');
  }

  async chat(messages: Message[]): Promise<string> {
    const { provider, apiKey, model } = this.getActiveProvider();

    const systemPrompt = `你是一个专业的AI编程助手，擅长根据用户的需求创建项目。
请用中文回复，除非用户用英文提问。
你能够：
1. 分析用户需求
2. 生成详细的执行计划
3. 创建和编辑文件
4. 运行命令安装依赖和执行代码

请始终保持专业、友好的态度。`;

    if (provider === 'anthropic') {
      return this.anthropicChat(apiKey, model, messages, systemPrompt);
    } else if (provider === 'openai') {
      return this.openaiChat(apiKey, model, messages, systemPrompt);
    } else {
      return this.openrouterChat(apiKey, model, messages, systemPrompt);
    }
  }

  private async anthropicChat(apiKey: string, model: string, messages: Message[], systemPrompt: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          system: systemPrompt,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }
      );
      if (!response.data.content?.[0]?.text) {
        throw new Error('API 返回为空，请检查 API Key 和模型配置');
      }
      return response.data.content[0].text;
    } catch (error: any) {
      let errorMessage = error.message || String(error);
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      if (errorMessage.includes('api key') || errorMessage.includes('API key') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid')) {
        throw new Error('API Key 无效或未配置，请检查设置中的 API Key');
      }
      if (errorMessage.includes('insufficient') || errorMessage.includes('credits') || errorMessage.includes('quota')) {
        throw new Error('API 配额不足，请检查账户余额或更换 API Key');
      }
      if (errorMessage.includes('rate limit') || errorMessage.includes('Rate limit')) {
        throw new Error('请求频率过高，请稍后再试');
      }
      throw new Error(`大模型调用失败: ${errorMessage}`);
    }
  }

  private async openaiChat(apiKey: string, model: string, messages: Message[], systemPrompt: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: model || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 4096,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }
      );
      if (!response.data.choices?.[0]?.message?.content) {
        throw new Error('API 返回为空，请检查 API Key 和模型配置');
      }
      return response.data.choices[0].message.content;
    } catch (error: any) {
      let errorMessage = error.message || String(error);
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      if (errorMessage.includes('api key') || errorMessage.includes('API key') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid')) {
        throw new Error('API Key 无效或未配置，请检查设置中的 API Key');
      }
      if (errorMessage.includes('insufficient') || errorMessage.includes('credits') || errorMessage.includes('quota')) {
        throw new Error('API 配额不足，请检查账户余额或更换 API Key');
      }
      if (errorMessage.includes('rate limit') || errorMessage.includes('Rate limit')) {
        throw new Error('请求频率过高，请稍后再试');
      }
      throw new Error(`大模型调用失败: ${errorMessage}`);
    }
  }

  private async openrouterChat(apiKey: string, model: string, messages: Message[], systemPrompt: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: model || 'z-ai/glm-4.5-air:free',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 4096,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        timeout: 120000,
      }
      );
      if (!response.data.choices?.[0]?.message?.content) {
        throw new Error('API 返回为空，请检查 API Key 和模型配置');
      }
      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('LLM API error:', error);
      
      let errorMessage = error.message || String(error);
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      
      if (errorMessage.includes('clipboard') || errorMessage.includes('image') || errorMessage.includes('vision') || errorMessage.includes('does not support image input')) {
        throw new Error('当前模型不支持图像输入，请更换为支持视觉的模型（如 Claude、GPT-4o 或 minimax-m2.5）');
      }
      if (errorMessage.includes('api key') || errorMessage.includes('API key') || errorMessage.includes('unauthorized') || errorMessage.includes('invalid')) {
        throw new Error('API Key 无效或未配置，请检查设置中的 API Key');
      }
      if (errorMessage.includes('testing period') || errorMessage.includes('come to an end') || errorMessage.includes('expired')) {
        throw new Error('当前使用的大模型已过期或不可用，请更换其他模型');
      }
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist') || errorMessage.includes('invalid model')) {
        throw new Error('指定的大模型不存在，请更换其他模型');
      }
      if (errorMessage.includes('insufficient') || errorMessage.includes('credits') || errorMessage.includes('quota')) {
        throw new Error('API 配额不足，请检查账户余额或更换 API Key');
      }
      if (errorMessage.includes('rate limit') || errorMessage.includes('Rate limit')) {
        throw new Error('请求频率过高，请稍后再试');
      }
      if (errorMessage.includes('connection') || errorMessage.includes('timeout') || errorMessage.includes('network')) {
        throw new Error('网络连接失败，请检查网络后重试');
      }
      throw new Error(`大模型调用失败: ${errorMessage}`);
    }
  }

  async generatePlan(requirements: string, existingFiles?: { path: string; content: string }[], isModification?: boolean): Promise<PlanStep[]> {
    const { provider, apiKey, model } = this.getActiveProvider();

    const context = existingFiles?.length
      ? `\n现有文件:\n${existingFiles.map(f => `文件: ${f.path}\n${f.content}`).join('\n\n')}`
      : '';

    const modeDescription = isModification
      ? `【修改模式】请在现有文件基础上进行修改，不要删除现有文件，除非用户明确要求删除。优先使用 EDIT_FILE 修改现有文件，而非 CREATE_FILE 新建文件。如果需要添加新功能，在现有文件结构上扩展。`
      : `【新建模式】请创建一个全新的项目。`;

    const prompt = `用户需求: ${requirements}${context}

${modeDescription}

请生成一个详细的执行计划。必须按照以下顺序生成步骤:
1. 先创建 requirements.txt 文件（如果项目需要依赖）
2. 再运行 INSTALL_PACKAGE 命令安装依赖（如 pip install -r requirements.txt 或 npm install）
3. 然后创建其他项目文件
4. 最后才启动服务器（RUN_SERVER）或打开浏览器（OPEN_BROWSER）

重要提示：
- Python 项目必须先生成 requirements.txt，然后安装依赖，最后启动服务器
- Node.js 项目必须先 npm install，然后启动服务器
- 不要在创建文件之前就安装依赖或启动服务器

请以JSON格式返回计划，不要包含其他内容。格式如下:
{
  "steps": [
    {
      "type": "CREATE_FILE" | "EDIT_FILE" | "DELETE_FILE" | "RUN_COMMAND" | "RUN_SERVER" | "INSTALL_PACKAGE" | "OPEN_BROWSER",
      "description": "步骤描述",
      "target": "文件路径(如果是文件操作)或服务器端口(仅RUN_SERVER类型，默认为8000)",
      "content": "文件内容(如果是创建/编辑文件)",
      "command": "命令(如果是运行命令或启动服务器)",
      "url": "浏览器URL(仅OPEN_BROWSER类型使用)"
    }
  ],
  "estimatedTime": "预计时间"
}`;

    const messages: Message[] = [
      { id: '1', role: 'user', content: prompt, timestamp: Date.now() },
    ];

    const response = await this.chat(messages);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.steps && Array.isArray(parsed.steps)) {
          return parsed.steps.map((step: any, index: number) => ({
            id: `step-${index + 1}`,
            ...step,
            status: 'pending' as const,
          }));
        }
      }
    } catch (e) {
      console.error('Failed to parse plan:', e);
    }

    return this.generateDefaultPlan(requirements);
  }

  private generateDefaultPlan(requirements: string): PlanStep[] {
    const steps: PlanStep[] = [];
    
    steps.push({
      id: 'step-1',
      type: 'CREATE_FILE',
      description: '创建项目结构',
      target: 'README.md',
      content: `# ${requirements}\n\n项目描述`,
      status: 'pending',
    });

    steps.push({
      id: 'step-2',
      type: 'CREATE_FILE',
      description: '创建主程序文件',
      target: 'index.js',
      content: '// Main entry point\nconsole.log("Hello, World!");',
      status: 'pending',
    });

    return steps;
  }
}
