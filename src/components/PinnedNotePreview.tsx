'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useGetNotes } from "@/features/home/api/use-get-notes";
import EditNoteModal from "@/features/home/components/notes/EditNoteModal";
import { NoteData } from "@/features/home/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

const PinnedNotePreview = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteData | null>(null);
  const [showAllDialog, setShowAllDialog] = useState(false);
  const { data } = useGetNotes();
  const t = useTranslations('home');

  const globalNotes: NoteData[] = (data?.documents.filter(note => note.isGlobal) || []) as NoteData[];

  if (globalNotes.length === 0) return null;

  const displayNotes = globalNotes.slice(0, 3);
  const hasMore = globalNotes.length > 3;

  const handleNoteClick = (note: NoteData) => {
    setSelectedNote(note);
  };

  return (
    <>
      <div className="fixed z-40 left-1/2 top-14 -translate-x-1/2 flex gap-2">
        {displayNotes.map((note, index) => {
          const isHovered = hoveredIndex === index;
          const displayTitle = note.title || "Quick note";
          const displayContent = note.content;

          return (
            <div
              key={note.$id}
              className="transition-all duration-300 ease-out"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={cn(
                  "relative rounded-xl border shadow-lg backdrop-blur transition-all duration-300 ease-out cursor-pointer",
                  note.bgColor === 'none'
                    ? 'bg-sidebar/80 backdrop-blur-md border-border'
                    : `${note.bgColor} text-white border-transparent`,
                  isHovered ? "w-[260px] p-4 max-h-36" : "w-[140px] p-2 max-h-14",
                  "overflow-hidden"
                )}
                onClick={() => handleNoteClick(note)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleNoteClick(note);
                  }
                }}
                aria-expanded={isHovered}
              >
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full w-2 rounded-l-xl",
                    note.bgColor === 'none' ? 'bg-primary/30' : 'bg-white/30'
                  )}
                  aria-hidden="true"
                />
                <div className="pl-3">
                  <h3 className={cn(
                    "text-sm font-semibold leading-tight",
                    note.bgColor === 'none' ? '' : 'text-white'
                  )}>
                    {displayTitle}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 text-sm",
                      note.bgColor === 'none' ? 'text-muted-foreground' : 'text-white/90',
                      isHovered ? "line-clamp-3" : "line-clamp-2"
                    )}
                  >
                    {displayContent}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {hasMore && (
          <div
            className="transition-all duration-300 ease-out"
            onMouseEnter={() => setHoveredIndex(999)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className={cn(
                "relative rounded-xl border shadow-lg cursor-pointer transition-all duration-300 ease-out",
                "w-[140px] h-14 bg-amber-200/90 text-slate-900",
                hoveredIndex === 999 && "scale-105"
              )}
              onClick={() => setShowAllDialog(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setShowAllDialog(true);
                }
              }}
            >
              {/* Efecto stacked: capa 1 (fondo) */}
              <div className="absolute inset-0 rounded-xl bg-amber-300/40 -rotate-2 transform translate-y-1" />
              {/* Efecto stacked: capa 2 (medio) */}
              <div className="absolute inset-0 rounded-xl bg-amber-300/60 rotate-1 transform translate-y-0.5" />
              {/* Capa principal */}
              <div className="relative flex items-center justify-center h-full bg-amber-200/90 rounded-xl border">
                <p className="text-xs font-semibold text-amber-950">
                  {t('view-all-notes')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog para mostrar todas las notas */}
      <Dialog open={showAllDialog} onOpenChange={setShowAllDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogTitle>{t('all-global-notes')}</DialogTitle>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {globalNotes.map((note) => {
              const displayTitle = note.title || "Quick note";
              const displayContent = note.content;

              return (
                <div
                  key={note.$id}
                  className={cn(
                    "relative rounded-xl border shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 p-4 min-h-[120px]",
                    note.bgColor === 'none'
                      ? 'bg-sidebar/80 backdrop-blur-md border-border'
                      : `${note.bgColor} text-white border-transparent`
                  )}
                  onClick={() => {
                    setShowAllDialog(false);
                    handleNoteClick(note);
                  }}
                >
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-full w-2 rounded-l-xl",
                      note.bgColor === 'none' ? 'bg-primary/30' : 'bg-white/30'
                    )}
                    aria-hidden="true"
                  />
                  <div className="pl-3">
                    <h3 className={cn(
                      "text-sm font-semibold leading-tight mb-2",
                      note.bgColor === 'none' ? '' : 'text-white'
                    )}>
                      {displayTitle}
                    </h3>
                    <p
                      className={cn(
                        "text-sm line-clamp-4",
                        note.bgColor === 'none' ? 'text-muted-foreground' : 'text-white/90'
                      )}
                    >
                      {displayContent}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {selectedNote && (
        <EditNoteModal
          note={selectedNote}
          isOpen={!!selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
    </>
  );
};

export default PinnedNotePreview;
