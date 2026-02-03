import { Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimestamp, formatDuration, extractModelName, formatTokenCount } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Request } from '@/lib/types';

interface RequestItemProps {
  request: Request;
  isSelected: boolean;
  onClick: () => void;
}

export function RequestItem({ request, isSelected, onClick }: RequestItemProps) {
  const model = request.requestBody?.model || 'unknown';
  const response = request.response;
  const isClaudeMessageResponse = response && 'type' in response && response.type === 'message';
  const isOpenAIResponse = response && 'object' in response && response.object === 'chat.completion';
  const isClaudeErrorResponse = response && 'type' in response && response.type === 'error';
  const hasError = !!request.error || isClaudeErrorResponse;

  // Calculate total input tokens including cache
  let totalInputTokens: number | undefined;
  let outputTokens: number | undefined;

  if (isClaudeMessageResponse && response) {
    const claudeResponse = response as any;
    totalInputTokens = (claudeResponse.usage.input_tokens || 0) +
      (claudeResponse.usage.cache_read_input_tokens || 0) +
      (claudeResponse.usage.cache_creation_input_tokens || 0);
    outputTokens = claudeResponse.usage.output_tokens;
  } else if (isOpenAIResponse && response) {
    const openaiResponse = response as any;
    totalInputTokens = openaiResponse.usage.prompt_tokens;
    outputTokens = openaiResponse.usage.completion_tokens;
  } else {
    totalInputTokens = undefined;
    outputTokens = undefined;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 border-b border-border transition-colors',
        'hover:bg-accent',
        isSelected && 'bg-accent'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {request.isStreaming && (
            <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
          )}
          <span className="text-sm font-medium truncate">
            {extractModelName(model)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          {hasError && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              error
            </Badge>
          )}
          {totalInputTokens !== undefined && outputTokens !== undefined && (
            <span className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              {formatTokenCount(totalInputTokens)}
              <ArrowDown className="h-3 w-3 ml-1" />
              {formatTokenCount(outputTokens)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
        <span>{formatTimestamp(request.timestamp)}</span>
        {request.durationMs !== undefined && (
          <span>{formatDuration(request.durationMs)}</span>
        )}
      </div>
    </button>
  );
}
