import { useTheme } from "../theme-provider";

export function ThemeDebug() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="fixed bottom-4 right-4 p-3 bg-card text-card-foreground rounded-lg shadow-lg z-50 flex flex-col gap-2">
      <div>
        <strong>Active Theme:</strong> {theme}
      </div>
      <div>
        <strong>HTML Classes:</strong> {document.documentElement.className}
      </div>
      <div className="flex gap-2 mt-2">
        <button 
          onClick={() => setTheme("light")}
          className="px-2 py-1 bg-secondary text-secondary-foreground rounded"
        >
          Light
        </button>
        <button 
          onClick={() => setTheme("dark")}
          className="px-2 py-1 bg-secondary text-secondary-foreground rounded"
        >
          Dark
        </button>
      </div>
    </div>
  );
}