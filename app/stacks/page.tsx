{/* Previous imports remain the same */}
import { Loader2 } from 'lucide-react';

export default function StacksPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState(searchParams.get('team') || 'KC');

  useEffect(() => {
    console.log('StacksPage: Initializing...');
    const loadData = async () => {
      try {
        console.log('StacksPage: Loading data for team:', selectedTeam);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('StacksPage: Data loaded successfully');
      } catch (err) {
        console.error('StacksPage: Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stacks');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedTeam]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center gap-2 min-h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg text-muted-foreground">Loading stacks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same
}