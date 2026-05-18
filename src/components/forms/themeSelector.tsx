import { useEffect, useMemo, useState } from "react";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Check, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import api from "@/lib/axios";

import { useThemeStore } from "@/stores/theme-store";
import { Theme } from "@/types/theme";

type ThemeSelectorProps = {
  selectedTheme: Theme | null;

  onChange: (theme: Theme | null) => void;

  isEditing?: boolean;

  allowCustomAdd?: boolean;
};

export function ThemeSelector({
  selectedTheme,
  onChange,
  isEditing = true,
  allowCustomAdd = true,
}: ThemeSelectorProps) {
  const [open, setOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const { themes, fetchThemes, addTheme } = useThemeStore();

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const filteredThemes = useMemo(() => {
    if (!searchTerm) return themes;

    return themes.filter((theme) =>
      theme.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, themes]);

  const handleSelectTheme = (theme: Theme) => {
    if (!isEditing) return;

    if (selectedTheme?.id === theme.id) {
      onChange(null);
    } else {
      onChange(theme);
    }

    setOpen(false);
  };

  const handleCustomAdd = async () => {
    if (!allowCustomAdd || !searchTerm.trim()) {
      return;
    }

    try {
      const { data } = await api.post("/themes", {
        name: searchTerm.trim(),

        icon: "Sparkles",
      });

      const newTheme = data.data;

      addTheme(newTheme);

      onChange(newTheme);

      setSearchTerm("");

      setOpen(false);
    } catch (error) {
      console.error("Error adding theme:", error);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={!isEditing}
            className="w-full cursor-pointer justify-between border-[#3a2a14] bg-[#1a1208] text-[#e8d5a3] hover:bg-[#24180c] hover:text-white"
          >
            <div className="flex items-center gap-2">
              {selectedTheme ? (
                <>
                  {(() => {
                    const Icon =
                      (LucideIcons[
                        selectedTheme.icon as keyof typeof LucideIcons
                      ] as LucideIcon) || LucideIcons.Circle;

                    return <Icon className="h-4 w-4" />;
                  })()}

                  <span>{selectedTheme.name}</span>
                </>
              ) : (
                <span>Select a theme</span>
              )}
            </div>

            <PlusCircle className="h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] space-y-3 border-[#3a2a14] bg-[#120c05] p-3 text-[#e8d5a3]"
          onWheel={(e) => e.stopPropagation()}
        >
          <Input
            autoFocus
            placeholder="Search themes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-[#3a2a14] bg-[#1a1208] text-[#e8d5a3] placeholder:text-[#5a4830]"
          />

          {allowCustomAdd && searchTerm.trim() && (
            <Button
              variant="ghost"
              onClick={handleCustomAdd}
              className="w-full justify-start text-[#d4b87a] hover:bg-[#24180c] hover:text-[#e8d5a3]"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add "{searchTerm.trim()}"
            </Button>
          )}

          <div className="max-h-[40vh] space-y-1 overflow-y-auto">
            {filteredThemes.length > 0 ? (
              filteredThemes.map((theme) => {
                const isSelected = selectedTheme?.id === theme.id;

                const Icon =
                  (LucideIcons[
                    theme.icon as keyof typeof LucideIcons
                  ] as LucideIcon) || LucideIcons.Circle;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme)}
                    className={`flex w-full items-center justify-between rounded-md p-2 text-left transition-all hover:bg-[#24180c] active:scale-[0.98] ${
                      isSelected ? "bg-[#2d210f] text-[#d4b87a]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />

                      <span>{theme.name}</span>
                    </div>

                    {isSelected && <Check className="h-4 w-4 text-[#d4b87a]" />}
                  </button>
                );
              })
            ) : (
              <p className="py-2 text-center text-sm text-[#5a4830]">
                No themes found
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedTheme ? (
        <p className="text-sm text-[#7a6548]">
          Selected: <strong>{selectedTheme.name}</strong>
        </p>
      ) : (
        <p className="text-sm text-[#5a4830]">No theme selected yet.</p>
      )}
    </div>
  );
}
