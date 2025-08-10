import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Database } from "lucide-react";
import { useEffect, useState, useCallback } from "react";


interface Drug {
  Drugname?: string;
  Price?: number;
  Company?: string;
  Form?: string;
  Category?: string;
  [key: string]: any;
}

export default function Drugs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<string>("Ready to search");

  const searchDrugs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setDatabaseStatus("Ready to search");
      return;
    }

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/drugs/search?q=${encodeURIComponent(query)}&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const drugsData = data.data?.drugs || [];
      
      setSearchResults(drugsData);
      setDatabaseStatus(`${drugsData.length} drugs found`);
    } catch (error: any) {
      console.error("Error searching drugs:", error);
      setDatabaseStatus(`Error: ${error.message || 'Unknown error'}`);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);





  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchDrugs(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchDrugs]);

  const handleRefresh = () => {
    if (searchTerm.trim()) {
      searchDrugs(searchTerm);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Egyptian Drug Database
          </h1>
          <p className="text-muted-foreground">
            Search and browse medications from the Egyptian Drug Authority (EDA)
          </p>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm text-foreground">
                  Database Status: {databaseStatus}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Type to search drugs by name, company, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing results for "{searchTerm}" - {searchResults.length} drugs found
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {searchResults.map((drug: Drug, index: number) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-foreground">
                    {drug.Drugname || 'N/A'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Company:</span> {drug.Company || 'N/A'}</p>
                    <p><span className="font-medium">Dosage Form:</span> {drug.Form || 'N/A'}</p>
                    {drug.Category && (
                      <p><span className="font-medium">Category:</span> {drug.Category}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'No drugs found matching your search.' : 'Start typing to search for drugs...'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}