// components/ui/copy-to-clipboard.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CopyToClipboardProps {
    text: string;
    label?: string;
    variant?: 'button' | 'icon' | 'text';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    successMessage?: string;
}

export function CopyToClipboard({
    text,
    label = 'Copy',
    variant = 'icon',
    size = 'sm',
    className = '',
    successMessage = 'Copied to clipboard!'
}: CopyToClipboardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success(successMessage);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    if (variant === 'text') {
        return (
            <button
                onClick={handleCopy}
                className={`text-sm text-muted-foreground hover:text-foreground transition-colors ${className}`}
            >
                {label}
            </button>
        );
    }

    if (variant === 'icon') {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className={`h-8 w-8 p-0 ${className}`}
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-600" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{copied ? 'Copied!' : 'Copy'}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    // Button variant
    return (
        <Button
            variant="outline"
            size={size}
            onClick={handleCopy}
            className={`gap-2 ${className}`}
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-600" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
            {copied ? 'Copied' : label}
        </Button>
    );
}