import { useState, type KeyboardEvent } from "react";
import { HiXMark } from "react-icons/hi2";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function TagInput({ tags = [], onChange, placeholder, className }: TagInputProps) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "," || e.key === " ") {
            e.preventDefault();
            addTag();
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = inputValue.trim().replace(/,/g, "");
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
            setInputValue("");
        }
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex flex-wrap gap-2 min-h-[42px] p-1.5 rounded-lg border border-input bg-transparent">
                {tags.map((tag, index) => (
                    <span
                        key={`${tag}-${index}`}
                        className="inline-flex items-center gap-1 rounded bg-lovely-secondary/20 px-2 py-1 text-sm font-medium text-lovely-secondary"
                    >
                        #{tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="text-lovely-secondary/70 hover:text-lovely-secondary"
                        >
                            <HiXMark className="h-4 w-4" />
                        </button>
                    </span>
                ))}
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-[120px] border-none bg-transparent focus-visible:ring-0 px-2 h-8"
                />
            </div>
            <p className="text-xs text-lovely-white/50">
                Pressione Enter, Espaço ou Vírgula para adicionar tags
            </p>
        </div>
    );
}
