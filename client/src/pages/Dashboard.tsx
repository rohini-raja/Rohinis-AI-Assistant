import { useTasks, exportData, useImportData, SHINOBI_DATA } from "@/hooks/use-tasks";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Upload, Flame, ScrollText, Quote, LayoutPanelLeft, Map as MapIcon, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NinjaTimer } from "@/components/NinjaTimer";
import { QuickNotes } from "@/components/QuickNotes";
import { NinjaMelodies } from "@/components/NinjaMelodies";
import { ShinobiMap } from "@/components/ShinobiMap";
import { NinjaCalendar } from "@/components/NinjaCalendar";

export default function Dashboard() {
  const { data: tasks, isLoading, error } = useTasks();
  const importData = useImportData();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [dialogue, setDialogue] = useState<{ text: string; author: string } | null>(null);
  const [showTools, setShowTools] = useState(false);
  const [mapVillageFilter, setMapVillageFilter] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // Determine dynamic dialogue based on progress
    if (!tasks) return;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    
    let pool = SHINOBI_DATA.quotes;
    // @ts-ignore - dialogues is added to SHINOBI_DATA
    if (pending > 5) pool = SHINOBI_DATA.dialogues.overwhelmed;
    // @ts-ignore
    else if (completed > 0 && pending === 0) pool = SHINOBI_DATA.dialogues.victorious;
    // @ts-ignore
    else if (completed > 3) pool = SHINOBI_DATA.dialogues.productive;
    // @ts-ignore
    else if (pending === 0) pool = SHINOBI_DATA.dialogues.idle;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * pool.length);
      setDialogue(pool[randomIndex]);
    }, 10000);
    
    setDialogue(pool[Math.floor(Math.random() * pool.length)]);
    return () => clearInterval(interval);
  }, [tasks]);

  const currentQuote = dialogue || SHINOBI_DATA.quotes[0];

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ninja-mission-log-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importData.mutate(json);
      } catch (err) {
        console.error("Invalid scroll data", err);
      }
    };
    reader.readAsText(file);
  };

  const filteredTasks = tasks?.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" ? true : 
                       activeTab === "completed" ? t.status === "completed" : 
                       t.status === "pending";
    const matchesVillage = mapVillageFilter ? t.village === mapVillageFilter : true;
    return matchesSearch && matchesTab && matchesVillage;
  }) || [];

  // Sort by created date desc
  filteredTasks.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

  // Count active missions
  const activeCount = tasks?.filter(t => t.status === 'pending').length || 0;

  if (error) return <div className="text-red-500 p-8 text-center font-bold text-xl">Mission intelligence unavailable. Check connection.</div>;

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      {/* Tool Sidebar Toggle */}
      <Button 
        size="icon" 
        onClick={() => setShowTools(!showTools)}
        className={`fixed left-4 bottom-4 z-50 rounded-full transition-all duration-300 shadow-xl ${showTools ? 'bg-primary rotate-90' : 'bg-neutral-800'}`}
      >
        <LayoutPanelLeft className="h-6 w-6" />
      </Button>

      {/* Ninja Tool Sidebar */}
      <AnimatePresence>
        {showTools && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-neutral-950/95 backdrop-blur-md border-r border-primary/20 p-4 z-40 overflow-y-auto custom-scrollbar pt-20"
          >
            <div className="space-y-6 pb-10">
              <NinjaTimer />
              <NinjaCalendar tasks={tasks || []} />
              <QuickNotes />
              <NinjaMelodies />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className={`transition-all duration-300 ${showTools ? 'lg:pl-80' : 'pl-0'}`}>
        {/* Header / Hero Section */}
        <header className="relative bg-neutral-900 border-b border-primary/30 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          
          <div className="container mx-auto px-4 py-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary rounded-full p-3 shadow-[0_0_15px_rgba(255,100,0,0.5)] border-2 border-black">
                  <Flame className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-display text-white tracking-wider text-shadow-ninja">
                    NINJA <span className="text-primary">TASKS</span>
                  </h1>
                  <p className="text-neutral-400 font-mono text-sm tracking-widest uppercase">
                    Village Mission Control
                  </p>
                </div>
              </div>

              {/* Dynamic Quote Section */}
              <div className="flex-1 max-w-xl hidden lg:block px-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuote.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-neutral-800/40 backdrop-blur-sm p-4 rounded-lg border-l-4 border-primary italic relative"
                  >
                    <Quote className="absolute -top-2 -left-2 h-6 w-6 text-primary/40 rotate-180" />
                    <p className="text-sm text-neutral-200 mb-1 font-shinobi">"{currentQuote.text}"</p>
                    <p className="text-xs text-primary font-bold text-right">— {currentQuote.author}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant={showMap ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setShowMap(!showMap)}
                  className={`border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 ${showMap ? 'bg-primary text-primary-foreground' : 'text-neutral-300'}`}
                >
                  <MapIcon className="mr-2 h-4 w-4" /> Strategic Map
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} className="border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:text-primary">
                  <Download className="mr-2 h-4 w-4" /> Seal Scroll
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm" className="border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:text-primary">
                    <Upload className="mr-2 h-4 w-4" /> Unseal Scroll
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search mission logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-neutral-950/50 border-neutral-800 focus:border-primary text-white placeholder:text-neutral-600"
                />
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="bg-neutral-800 px-4 py-2 rounded border border-neutral-700">
                    <span className="text-xs text-neutral-400 uppercase font-bold mr-2 font-shinobi">Active Missions:</span>
                    <span className="text-xl font-display text-primary">{activeCount}</span>
                 </div>
                 <CreateTaskDialog />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <AnimatePresence>
            {showMap && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8 overflow-hidden"
              >
                <ShinobiMap 
                  tasks={tasks || []} 
                  onVillageClick={(v) => setMapVillageFilter(mapVillageFilter === v ? null : v)}
                  activeVillage={mapVillageFilter || undefined}
                />
                {mapVillageFilter && (
                  <div className="flex justify-center mt-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setMapVillageFilter(null)}
                      className="text-primary hover:text-primary hover:bg-primary/10 font-bold"
                    >
                      <X className="mr-2 h-4 w-4" /> Clear Map Filter ({SHINOBI_DATA.villages.find(v => v.id === mapVillageFilter)?.name})
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-neutral-900 border border-neutral-800 p-1">
              <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-black font-bold">Active Missions</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-bold">Completed</TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-neutral-700 font-bold">Archives</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-lg bg-neutral-900 animate-pulse border border-neutral-800" />
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <TaskCard task={task} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 rounded-full bg-neutral-900 border-4 border-neutral-800 flex items-center justify-center mb-6">
                <ScrollText className="h-10 w-10 text-neutral-600" />
              </div>
              <h3 className="text-2xl font-display text-neutral-500 mb-2">No Missions Found</h3>
              <p className="text-neutral-400 max-w-md">
                {activeTab === 'completed' 
                  ? "You haven't completed any missions yet. Get to work!" 
                  : "Your mission scroll is empty. Assign a new task to begin."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
