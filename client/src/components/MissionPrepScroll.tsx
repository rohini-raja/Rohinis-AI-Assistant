import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Scroll, Plus, Trash2, Check, Package, Swords, BookOpen, Utensils, Shirt, Heart, Wrench, Sparkles, X, ChevronDown, PackageOpen, FolderPlus, ChevronLeft, ChevronRight } from "lucide-react";
import type { PackingItem } from "@shared/schema";

const CATEGORIES = [
  { id: "weapons", label: "Weapons & Gear", icon: Swords, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  { id: "scrolls", label: "Scrolls & Docs", icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { id: "provisions", label: "Provisions", icon: Utensils, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { id: "attire", label: "Attire", icon: Shirt, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { id: "medical", label: "Medical Kit", icon: Heart, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { id: "tools", label: "Tools & Other", icon: Wrench, color: "text-neutral-400", bg: "bg-neutral-500/10 border-neutral-500/20" },
] as const;

const QUICK_ADD_TEMPLATES: Record<string, string[]> = {
  weapons: ["Kunai (x5)", "Shuriken (x10)", "Explosive Tags", "Wire Strings", "Smoke Bombs"],
  scrolls: ["Mission Scroll", "Passport", "Travel Tickets", "Map", "Emergency Contacts"],
  provisions: ["Water Flask", "Ration Pills", "Trail Snacks", "Energy Bars", "First Aid Water"],
  attire: ["Ninja Vest", "Extra Outfit", "Rain Cloak", "Sandals", "Headband"],
  medical: ["Bandages", "Antidote Kit", "Pain Meds", "Healing Salve", "Chakra Pills"],
  tools: ["Phone Charger", "Flashlight", "Rope", "Sleeping Bag", "Money Pouch"],
};

function getSavedLists(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem("ninja-packing-lists") || '["default"]');
    if (!saved.includes("default")) saved.unshift("default");
    return saved;
  } catch { return ["default"]; }
}

function saveLists(lists: string[]) {
  localStorage.setItem("ninja-packing-lists", JSON.stringify(lists));
}

export function MissionPrepScroll() {
  const [isOpen, setIsOpen] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("tools");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [lists, setLists] = useState<string[]>(getSavedLists);
  const [activeList, setActiveList] = useState(() => {
    const saved = localStorage.getItem("ninja-active-packing-list") || "default";
    const allLists = getSavedLists();
    return allLists.includes(saved) ? saved : "default";
  });
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    localStorage.setItem("ninja-active-packing-list", activeList);
  }, [activeList]);

  const { data: items = [], isLoading } = useQuery<PackingItem[]>({
    queryKey: ["/api/packing", activeList],
    queryFn: async () => {
      const res = await fetch(`/api/packing?list=${encodeURIComponent(activeList)}`);
      if (!res.ok) throw new Error("Failed to load packing items");
      return res.json();
    },
  });

  const invalidateForList = (listName: string) => queryClient.invalidateQueries({ queryKey: ["/api/packing", listName] });

  const addItem = useMutation({
    mutationFn: async (item: { content: string; category: string; listName: string }) => {
      const res = await fetch("/api/packing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Failed to add item");
      return { ...(await res.json()), _listName: item.listName };
    },
    onSuccess: (_data, variables) => invalidateForList(variables.listName),
  });

  const toggleItem = useMutation({
    mutationFn: async ({ id, packed }: { id: number; packed: boolean }) => {
      const res = await fetch(`/api/packing/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packed }),
      });
      if (!res.ok) throw new Error("Failed to toggle item");
      return res.json();
    },
    onSuccess: () => invalidateForList(activeList),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/packing/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => invalidateForList(activeList),
  });

  const clearAll = useMutation({
    mutationFn: async (listName: string) => {
      const res = await fetch(`/api/packing/list/${encodeURIComponent(listName)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear list");
      return listName;
    },
    onSuccess: (_data, listName) => invalidateForList(listName),
  });

  const unpackAll = useMutation({
    mutationFn: async () => {
      const packedItems = items.filter(i => i.packed);
      const results = await Promise.all(packedItems.map(item =>
        fetch(`/api/packing/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packed: false }),
        }).then(r => ({ ok: r.ok, id: item.id }))
      ));
      const failed = results.filter(r => !r.ok);
      if (failed.length > 0) throw new Error(`Failed to unpack ${failed.length} item(s)`);
    },
    onSuccess: () => invalidateForList(activeList),
  });

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    addItem.mutate({ content: newItemText.trim(), category: selectedCategory, listName: activeList });
    setNewItemText("");
  };

  const handleQuickAdd = (content: string, category: string) => {
    if (items.find(i => i.content === content && i.category === category)) return;
    addItem.mutate({ content, category, listName: activeList });
  };

  const handleCreateList = () => {
    const name = newListName.trim();
    if (!name || lists.includes(name)) return;
    const updated = [...lists, name];
    setLists(updated);
    saveLists(updated);
    setActiveList(name);
    setNewListName("");
    setIsCreatingList(false);
  };

  const handleDeleteList = () => {
    if (activeList === "default") return;
    const listToDelete = activeList;
    clearAll.mutate(listToDelete, {
      onSuccess: () => {
        const updated = lists.filter(l => l !== listToDelete);
        setLists(updated);
        saveLists(updated);
        setActiveList("default");
      },
    });
  };

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const totalItems = items.length;
  const packedCount = items.filter(i => i.packed).length;
  const progressPercent = totalItems > 0 ? (packedCount / totalItems) * 100 : 0;
  const allPacked = totalItems > 0 && packedCount === totalItems;

  const groupedItems = CATEGORIES.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.id),
  })).filter(g => g.items.length > 0);

  const activeListIdx = lists.indexOf(activeList);

  return (
    <Card className="p-4 bg-neutral-900 border-primary/30 shadow-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
        data-testid="mission-prep-toggle"
      >
        <h3 className="text-lg font-display text-primary flex items-center gap-2">
          <Package className="h-5 w-5" />
          MISSION PREP
        </h3>
        <div className="flex items-center gap-2">
          {totalItems > 0 && (
            <span className="text-[9px] font-mono text-neutral-500">
              {packedCount}/{totalItems}
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-primary"
          >
            <Scroll className="h-4 w-4" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => activeListIdx > 0 && setActiveList(lists[activeListIdx - 1])}
                  className={`p-0.5 rounded ${activeListIdx > 0 ? 'text-neutral-400 hover:text-white' : 'text-neutral-800'}`}
                  disabled={activeListIdx <= 0}
                  data-testid="prep-list-prev"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-[9px] font-mono text-primary uppercase tracking-wider" data-testid="prep-active-list-name">
                    {activeList === "default" ? "General Prep" : activeList}
                  </span>
                  <span className="text-[7px] text-neutral-600 ml-1">
                    ({activeListIdx + 1}/{lists.length})
                  </span>
                </div>
                <button
                  onClick={() => activeListIdx < lists.length - 1 && setActiveList(lists[activeListIdx + 1])}
                  className={`p-0.5 rounded ${activeListIdx < lists.length - 1 ? 'text-neutral-400 hover:text-white' : 'text-neutral-800'}`}
                  disabled={activeListIdx >= lists.length - 1}
                  data-testid="prep-list-next"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setIsCreatingList(!isCreatingList)}
                  className="p-0.5 rounded text-neutral-500 hover:text-primary transition-colors"
                  data-testid="prep-new-list-toggle"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </button>
              </div>

              <AnimatePresence>
                {isCreatingList && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-1">
                      <Input
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                        placeholder="New list name (e.g. KUL Trip)..."
                        className="h-6 bg-neutral-950 border-neutral-800 text-[9px] focus:border-primary flex-1"
                        data-testid="prep-new-list-input"
                      />
                      <Button size="sm" className="h-6 px-2 text-[8px]" onClick={handleCreateList} disabled={!newListName.trim()} data-testid="prep-new-list-create">
                        Create
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {totalItems > 0 && (
                <div className="space-y-1">
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${allPacked ? 'bg-green-500' : 'bg-primary'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[8px] text-neutral-600 font-mono">
                      {allPacked ? "ALL PACKED! READY FOR MISSION" : `${Math.round(progressPercent)}% PACKED`}
                    </span>
                    {allPacked && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-[8px] text-green-400 font-bold flex items-center gap-0.5"
                      >
                        <Sparkles className="h-3 w-3" /> MISSION READY
                      </motion.span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-1 flex-wrap">
                {CATEGORIES.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] border transition-all ${selectedCategory === cat.id ? `${cat.bg} ${cat.color} font-bold` : 'border-neutral-800 text-neutral-600 hover:border-neutral-600'}`}
                      data-testid={`prep-category-${cat.id}`}
                    >
                      <CatIcon className="h-2.5 w-2.5" />
                      {cat.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-1">
                <Input
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  placeholder="Add item to pack..."
                  className="h-7 bg-neutral-950 border-neutral-800 text-[10px] focus:border-primary flex-1"
                  data-testid="prep-item-input"
                />
                <Button
                  size="sm"
                  className="h-7 px-2"
                  onClick={handleAddItem}
                  disabled={!newItemText.trim()}
                  data-testid="prep-add-item"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[8px]"
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  data-testid="prep-quick-add-toggle"
                >
                  <Sparkles className="h-3 w-3" />
                </Button>
              </div>

              <AnimatePresence>
                {showQuickAdd && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-neutral-950 rounded border border-neutral-800 p-2 space-y-1">
                      <p className="text-[8px] text-neutral-500 uppercase font-bold mb-1">
                        Quick Add — {CATEGORIES.find(c => c.id === selectedCategory)?.label}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {QUICK_ADD_TEMPLATES[selectedCategory]?.map((template) => {
                          const alreadyAdded = items.some(i => i.content === template && i.category === selectedCategory);
                          return (
                            <button
                              key={template}
                              onClick={() => handleQuickAdd(template, selectedCategory)}
                              disabled={alreadyAdded}
                              className={`text-[8px] px-2 py-1 rounded border transition-all ${alreadyAdded ? 'border-green-500/30 text-green-500/50 line-through' : 'border-neutral-700 text-neutral-400 hover:border-primary hover:text-primary'}`}
                              data-testid={`prep-quick-${template.replace(/\s+/g, '-').toLowerCase()}`}
                            >
                              {alreadyAdded ? "✓ " : "+ "}{template}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                {groupedItems.map((group) => {
                  const GroupIcon = group.icon;
                  const groupPacked = group.items.filter(i => i.packed).length;
                  const isCollapsed = collapsedCategories.has(group.id);
                  return (
                    <motion.div
                      key={group.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <button
                        onClick={() => toggleCategoryCollapse(group.id)}
                        className={`flex items-center gap-1.5 mb-1 w-full text-left ${group.color}`}
                        data-testid={`prep-collapse-${group.id}`}
                      >
                        <motion.div
                          animate={{ rotate: isCollapsed ? -90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-2.5 w-2.5" />
                        </motion.div>
                        <GroupIcon className="h-3 w-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{group.label}</span>
                        <span className="text-[8px] opacity-50 font-mono">
                          {groupPacked}/{group.items.length}
                        </span>
                        {groupPacked === group.items.length && group.items.length > 0 && (
                          <Check className="h-2.5 w-2.5 text-green-500 ml-auto" />
                        )}
                      </button>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-0.5 ml-4">
                              <AnimatePresence>
                                {group.items.map((item, idx) => (
                                  <motion.div
                                    key={item.id}
                                    initial={{ x: -30, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 30, opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                                    className={`flex items-center gap-2 group py-1 px-1.5 rounded transition-colors ${item.packed ? 'bg-green-500/5' : 'hover:bg-neutral-800/50'}`}
                                  >
                                    <button
                                      onClick={() => toggleItem.mutate({ id: item.id, packed: !item.packed })}
                                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${item.packed ? 'bg-green-500 border-green-500' : 'border-neutral-600 hover:border-primary'}`}
                                      data-testid={`prep-toggle-${item.id}`}
                                    >
                                      {item.packed && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                        >
                                          <Check className="h-2.5 w-2.5 text-white" />
                                        </motion.div>
                                      )}
                                    </button>
                                    <span className={`text-[10px] flex-1 transition-all ${item.packed ? 'line-through text-neutral-600' : 'text-neutral-300'}`}>
                                      {item.content}
                                    </span>
                                    {item.packed && (
                                      <motion.span
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="text-[8px] text-green-500"
                                      >
                                        ✓
                                      </motion.span>
                                    )}
                                    <button
                                      onClick={() => deleteItem.mutate(item.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      data-testid={`prep-delete-${item.id}`}
                                    >
                                      <X className="h-3 w-3 text-neutral-600 hover:text-red-400" />
                                    </button>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {isLoading && (
                  <div className="text-center py-6">
                    <Package className="h-8 w-8 text-neutral-700 mx-auto mb-2 animate-pulse" />
                    <p className="text-[10px] text-neutral-600">Loading packing list...</p>
                  </div>
                )}

                {!isLoading && totalItems === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6"
                  >
                    <Package className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
                    <p className="text-[10px] text-neutral-600">No items yet. Start packing for your mission!</p>
                    <p className="text-[8px] text-neutral-700 mt-1">Use quick-add or type your own items</p>
                  </motion.div>
                )}
              </div>

              {(totalItems > 0 || activeList !== "default") && (
                <div className="flex justify-between pt-1 border-t border-neutral-800">
                  <div className="flex gap-1">
                    {packedCount > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[8px] text-yellow-400 hover:text-yellow-300"
                        onClick={() => unpackAll.mutate()}
                        disabled={unpackAll.isPending}
                        data-testid="prep-unpack-all"
                      >
                        <PackageOpen className="h-2.5 w-2.5 mr-1" />
                        Unpack All
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {activeList !== "default" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[8px] text-orange-400 hover:text-orange-300"
                        onClick={handleDeleteList}
                        data-testid="prep-delete-list"
                      >
                        <Trash2 className="h-2.5 w-2.5 mr-1" />
                        Delete List
                      </Button>
                    )}
                    {totalItems > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[8px] text-red-400 hover:text-red-300"
                        onClick={() => clearAll.mutate(activeList)}
                        data-testid="prep-clear-all"
                      >
                        <Trash2 className="h-2.5 w-2.5 mr-1" />
                        Clear Items
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
