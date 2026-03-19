"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Chalet, AppState, Room } from "@/lib/types";
import { INITIAL_CHALETS } from "@/lib/data";
import { parsePeople, findPersonLocation } from "@/lib/utils";
import SetupScreen from "@/components/SetupScreen";
import styles from "./page.module.css";

/* ─── Draggable chip ─── */
function PersonChip({
  id,
  name,
  variant = "default",
  isDragOverlay = false,
}: {
  id: string;
  name: string;
  variant?: "default" | "room" | "unassigned";
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
  });

  const initial = name.charAt(0).toUpperCase();

  if (isDragOverlay) {
    return (
      <div className={`${styles.chip} ${styles.chipOverlay}`}>
        <span className={styles.chipInitial}>{initial}</span>
        <span className={styles.chipName}>{name}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${styles.chip} ${styles[`chip_${variant}`] || ""} ${
        isDragging ? styles.chipDragging : ""
      }`}
    >
      <span className={styles.chipInitial}>{initial}</span>
      <span className={styles.chipName}>{name}</span>
    </div>
  );
}

/* ─── Remove button on chips in rooms ─── */
function RoomChip({
  personId,
  name,
  onRemove,
}: {
  personId: string;
  name: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: personId,
  });

  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${styles.chip} ${styles.chip_room} ${
        isDragging ? styles.chipDragging : ""
      }`}
    >
      <span className={styles.chipInitial}>{initial}</span>
      <span className={styles.chipName}>{name}</span>
      <button
        className={styles.chipRemove}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        title="Retirer"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M3 3L9 9M9 3L3 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

/* ─── Droppable room zone ─── */
function RoomZone({
  room,
  chaletColor,
  activeId,
  onRemovePerson,
}: {
  room: Room;
  chaletColor: string;
  activeId: string | null;
  onRemovePerson: (roomId: string, personId: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: room.id });
  const isFull = room.occupants.length >= room.capacity;
  const remaining = room.capacity - room.occupants.length;
  const canDrop = activeId !== null && !isFull;

  return (
    <div
      ref={setNodeRef}
      className={`${styles.roomZone} ${isOver && canDrop ? styles.roomZoneOver : ""} ${
        isFull ? styles.roomZoneFull : ""
      } ${canDrop && !isOver ? styles.roomZoneReady : ""}`}
      style={
        {
          "--chalet-color": chaletColor,
          "--drop-color": chaletColor,
        } as React.CSSProperties
      }
    >
      <div className={styles.roomHeader}>
        <div className={styles.roomInfo}>
          <span className={styles.roomName}>{room.name}</span>
          <span className={styles.roomBeds}>{room.bedDescription}</span>
        </div>
        <div
          className={`${styles.roomCounter} ${
            isFull ? styles.roomCounterFull : ""
          }`}
        >
          {room.occupants.length}/{room.capacity}
        </div>
      </div>
      <div className={styles.roomOccupants}>
        {room.occupants.map((p) => (
          <RoomChip
            key={p}
            personId={p}
            name={p}
            onRemove={() => onRemovePerson(room.id, p)}
          />
        ))}
        {Array.from({ length: remaining }).map((_, i) => (
          <div
            key={`slot-${i}`}
            className={`${styles.emptySlot} ${
              isOver && canDrop && i === 0 ? styles.emptySlotTarget : ""
            }`}
          >
            {isOver && canDrop && i === 0 && activeId ? (
              <span className={styles.ghostName}>
                {activeId.charAt(0).toUpperCase()}
              </span>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                opacity="0.3"
              >
                <rect
                  x="1"
                  y="6"
                  width="14"
                  height="8"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M3 6V4a2 2 0 012-2h6a2 2 0 012 2v2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Droppable unassigned pool ─── */
function UnassignedPool({
  unassigned,
  activeId,
  isDragging,
}: {
  unassigned: string[];
  activeId: string | null;
  isDragging: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: "unassigned-pool" });
  const isFromRoom =
    isDragging && activeId !== null && !unassigned.includes(activeId);

  return (
    <div
      ref={setNodeRef}
      className={`${styles.pool} ${isOver && isFromRoom ? styles.poolOver : ""} ${
        isDragging ? styles.poolDragging : ""
      }`}
    >
      <div className={styles.poolHeader}>
        <div className={styles.poolTitle}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            className={styles.poolIcon}
          >
            <circle cx="9" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>
            {unassigned.length === 0
              ? "Tout le monde est placé !"
              : `${unassigned.length} personne${unassigned.length > 1 ? "s" : ""} à placer`}
          </span>
        </div>
        {isFromRoom && (
          <span className={styles.poolHint}>Lâcher ici pour retirer</span>
        )}
      </div>
      {unassigned.length > 0 && (
        <div className={styles.poolChips}>
          {unassigned.map((p) => (
            <PersonChip key={p} id={p} name={p} variant="unassigned" />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Chalet card ─── */
function ChaletCard({
  chalet,
  activeId,
  onRemovePerson,
  compact = false,
}: {
  chalet: Chalet;
  activeId: string | null;
  onRemovePerson: (roomId: string, personId: string) => void;
  compact?: boolean;
}) {
  const totalOccupants = chalet.floors.reduce(
    (sum, f) => sum + f.rooms.reduce((s, r) => s + r.occupants.length, 0),
    0
  );
  const pct = chalet.capacity > 0 ? (totalOccupants / chalet.capacity) * 100 : 0;

  if (compact) {
    const room = chalet.floors[0]?.rooms[0];
    if (!room) return null;
    return (
      <div
        className={styles.miniChalet}
        style={{ "--chalet-color": chalet.color } as React.CSSProperties}
      >
        <div className={styles.miniHeader}>
          <span className={styles.miniName}>{chalet.name}</span>
          <span
            className={`${styles.miniCounter} ${
              room.occupants.length >= room.capacity ? styles.miniCounterFull : ""
            }`}
          >
            {room.occupants.length}/{room.capacity}
          </span>
        </div>
        <RoomZone
          room={room}
          chaletColor={chalet.color}
          activeId={activeId}
          onRemovePerson={onRemovePerson}
        />
      </div>
    );
  }

  return (
    <div
      className={styles.chaletCard}
      style={{ "--chalet-color": chalet.color } as React.CSSProperties}
    >
      <div className={styles.chaletHeader}>
        <div>
          <h3 className={styles.chaletName}>{chalet.name}</h3>
          <span className={styles.chaletCapacity}>{chalet.capacity} places</span>
        </div>
        <div className={styles.chaletProgress}>
          <div className={styles.chaletProgressBar}>
            <div
              className={styles.chaletProgressFill}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={styles.chaletProgressText}>
            {totalOccupants}/{chalet.capacity}
          </span>
        </div>
      </div>

      {chalet.floors.map((floor, fi) => (
        <div key={fi} className={styles.floorSection}>
          {floor.name && (
            <div className={styles.floorLabel}>
              <div className={styles.floorLabelLine} />
              <span className={styles.floorLabelText}>
                {floor.name === "RDC" ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <rect
                        x="1"
                        y="7"
                        width="12"
                        height="6"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M7 1L13 7H1L7 1Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Rez-de-chaussée
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <path
                        d="M2 12h4V8h2v4h4V6L7 2 2 6v6z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Étage
                  </>
                )}
              </span>
              <div className={styles.floorLabelLine} />
            </div>
          )}
          <div className={styles.floorRooms}>
            {floor.rooms.map((room) => (
              <RoomZone
                key={room.id}
                room={room}
                chaletColor={chalet.color}
                activeId={activeId}
                onRemovePerson={onRemovePerson}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main App ─── */
function deepCloneChalets(chalets: Chalet[]): Chalet[] {
  return chalets.map((c) => ({
    ...c,
    floors: c.floors.map((f) => ({
      ...f,
      rooms: f.rooms.map((r) => ({ ...r, occupants: [...r.occupants] })),
    })),
  }));
}

/* ─── Persistence helpers ─── */
async function fetchState(): Promise<{ screen: string; state: AppState } | null> {
  try {
    const res = await fetch("/api/state");
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

async function persistState(screen: string, state: AppState) {
  try {
    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ screen, state }),
    });
  } catch {
    // silently fail
  }
}

export default function Home() {
  const [screen, setScreen] = useState<"setup" | "main" | "loading">("loading");
  const [state, setState] = useState<AppState>({
    chalets: deepCloneChalets(INITIAL_CHALETS),
    people: [],
    unassigned: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);

  // Load saved state on mount
  useEffect(() => {
    fetchState().then((saved) => {
      if (saved?.state?.people && saved.state.people.length > 0) {
        setState(saved.state);
        setScreen(saved.screen === "main" ? "main" : "setup");
      } else {
        setScreen("setup");
      }
      isInitialized.current = true;
    });
  }, []);

  // Auto-save on every state change (debounced 500ms)
  useEffect(() => {
    if (!isInitialized.current) return;
    if (screen === "loading") return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persistState(screen, state);
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, screen]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    })
  );

  const handleStart = useCallback((input: string) => {
    const newPeople = parsePeople(input);

    setState((prev) => {
      if (prev.people.length > 0) {
        // Merge: preserve existing room assignments
        const chalets = deepCloneChalets(prev.chalets);
        const removedPeople = prev.people.filter(
          (p) => !newPeople.includes(p)
        );

        // Remove deleted people from rooms
        for (const c of chalets) {
          for (const f of c.floors) {
            for (const r of f.rooms) {
              r.occupants = r.occupants.filter(
                (p) => !removedPeople.includes(p)
              );
            }
          }
        }

        // Keep existing unassigned minus removed, add new people
        const currentUnassigned = prev.unassigned.filter(
          (p) => !removedPeople.includes(p)
        );
        const addedPeople = newPeople.filter(
          (p) => !prev.people.includes(p)
        );

        return {
          chalets,
          people: newPeople,
          unassigned: [...currentUnassigned, ...addedPeople],
        };
      }

      // Fresh start
      return {
        chalets: deepCloneChalets(INITIAL_CHALETS),
        people: newPeople,
        unassigned: [...newPeople],
      };
    });

    setIsEditing(false);
    setScreen("main");
  }, []);

  const handleEditList = useCallback(() => {
    setIsEditing(true);
    setScreen("setup");
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const personId = active.id as string;
      const targetId = over.id as string;

      setState((prev) => {
        const chalets = deepCloneChalets(prev.chalets);
        let unassigned = [...prev.unassigned];

        // Find where the person currently is
        const currentLoc = findPersonLocation(chalets, personId);
        const isInUnassigned = unassigned.includes(personId);

        if (targetId === "unassigned-pool") {
          // Move back to unassigned
          if (currentLoc) {
            for (const c of chalets) {
              for (const f of c.floors) {
                for (const r of f.rooms) {
                  if (r.id === currentLoc.roomId) {
                    r.occupants = r.occupants.filter((p) => p !== personId);
                  }
                }
              }
            }
            unassigned.push(personId);
          }
          return { ...prev, chalets, unassigned };
        }

        // Target is a room - find it
        let targetRoom: Room | null = null;
        for (const c of chalets) {
          for (const f of c.floors) {
            for (const r of f.rooms) {
              if (r.id === targetId) targetRoom = r;
            }
          }
        }
        if (!targetRoom) return prev;
        if (targetRoom.occupants.length >= targetRoom.capacity) return prev;
        if (currentLoc?.roomId === targetId) return prev;

        // Remove from current location
        if (currentLoc) {
          for (const c of chalets) {
            for (const f of c.floors) {
              for (const r of f.rooms) {
                if (r.id === currentLoc.roomId) {
                  r.occupants = r.occupants.filter((p) => p !== personId);
                }
              }
            }
          }
        } else if (isInUnassigned) {
          unassigned = unassigned.filter((p) => p !== personId);
        }

        // Add to target room
        targetRoom.occupants.push(personId);

        return { ...prev, chalets, unassigned };
      });
    },
    []
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleRemovePerson = useCallback(
    (roomId: string, personId: string) => {
      setState((prev) => {
        const chalets = deepCloneChalets(prev.chalets);
        for (const c of chalets) {
          for (const f of c.floors) {
            for (const r of f.rooms) {
              if (r.id === roomId) {
                r.occupants = r.occupants.filter((p) => p !== personId);
              }
            }
          }
        }
        return {
          ...prev,
          chalets,
          unassigned: [...prev.unassigned, personId],
        };
      });
    },
    []
  );

  const handleReset = useCallback(() => {
    const freshState = {
      chalets: deepCloneChalets(INITIAL_CHALETS),
      people: [],
      unassigned: [],
    };
    setState(freshState);
    setScreen("setup");
    persistState("setup", freshState);
  }, []);

  const totalPeople = state.people.length;
  const placedPeople = totalPeople - state.unassigned.length;
  const pct = totalPeople > 0 ? (placedPeople / totalPeople) * 100 : 0;
  const largeChalets = useMemo(
    () => state.chalets.filter((c) => c.capacity > 2),
    [state.chalets]
  );
  const smallChalets = useMemo(
    () => state.chalets.filter((c) => c.capacity <= 2),
    [state.chalets]
  );

  if (screen === "loading") {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Chargement...</p>
      </div>
    );
  }

  if (screen === "setup") {
    return (
      <SetupScreen
        onStart={handleStart}
        initialInput={state.people.length > 0 ? state.people.join("\n") : undefined}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Répartition des Chambres</h1>
            <p className={styles.subtitle}>
              Glisse les noms dans les chambres
            </p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.progressInfo}>
              <span className={styles.progressCount}>
                {placedPeople}/{totalPeople}
              </span>
              <span className={styles.progressLabel}>placés</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              className={styles.btnReset}
              onClick={handleEditList}
              title="Modifier la liste"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M10.5 1.5l2 2L4.5 11.5l-3 1 1-3L10.5 1.5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className={styles.btnReset}
              onClick={handleReset}
              title="Tout recommencer"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 7a6 6 0 1011.5-2.3M12.5 1v3.7h-3.7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className={styles.layout}>
          {/* Left sidebar — unassigned people */}
          <aside className={styles.sidebar}>
            <UnassignedPool
              unassigned={state.unassigned}
              activeId={activeId}
              isDragging={activeId !== null}
            />
          </aside>

          {/* Right — chalets */}
          <main className={styles.main}>
            {/* Large chalets */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Grands Chalets</h2>
              <div className={styles.largeGrid}>
                {largeChalets.map((chalet) => (
                  <ChaletCard
                    key={chalet.id}
                    chalet={chalet}
                    activeId={activeId}
                    onRemovePerson={handleRemovePerson}
                  />
                ))}
              </div>
            </section>

            {/* Small chalets */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Chalets Individuels — 2 places</h2>
              <div className={styles.smallGrid}>
                {smallChalets.map((chalet) => (
                  <ChaletCard
                    key={chalet.id}
                    chalet={chalet}
                    activeId={activeId}
                    onRemovePerson={handleRemovePerson}
                    compact
                  />
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <PersonChip
            id={activeId}
            name={activeId}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>

    </DndContext>
  );
}
