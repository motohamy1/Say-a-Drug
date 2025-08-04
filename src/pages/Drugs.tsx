import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Database, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
<<<<<<< HEAD
=======
import { drugsAPI } from "@/services/api";
>>>>>>> 564621e5aa9ae889e7edd4ba9dbb0b0723380926

interface Drug {
  Drugname?: string;
  Price?: number;
  Company?: string;
  Form?: string;
  Category?: string;
  [key: string]: any;
}

interface ApiResponse {
  drugs: Drug[];
  total: number;
  page: number;
  totalPages: number;
}

export default function Drugs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDrugs, setTotalDrugs] = useState(0);
  const [databaseStatus, setDatabaseStatus] = useState<string>("Loading...");

  // Debounced search function
  const fetchDrugs = useCallback(async (search: string = "", page: number = 1) => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const API_BASE_URL = 'http://localhost:3001/api';
      const url = new URL(`${API_BASE_URL}/drugs`);
      url.searchParams.append('search', search);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '100');

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
        throw new Error(errorData.message || 'An unknown error occurred');
      }
      
      const data = await response.json();
=======
      const data = await drugsAPI.fetchDrugs({
        search,
        page,
        limit: 12
      });
>>>>>>> 564621e5aa9ae889e7edd4ba9dbb0b0723380926
      
      setDrugs(data.drugs || []);
      setTotalPages(data.totalPages || 1);
      setTotalDrugs(data.total || 0);
      setCurrentPage(data.page || 1);
      setDatabaseStatus(`${data.total || 0} drugs loaded`);
    } catch (error) {
      console.error("Error fetching drugs:", error);
      setDatabaseStatus("Error loading database");
      setDrugs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDrugs();
  }, [fetchDrugs]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "") {
        fetchDrugs(searchTerm, 1);
        setCurrentPage(1);
      } else {
        fetchDrugs("", 1);
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchDrugs]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchDrugs(searchTerm, newPage);
    }
  };

  const handleRefresh = () => {
    fetchDrugs(searchTerm, currentPage);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Egyptian Drug Database
          </h1>
          <p className="text-gray-600">
            Search and browse medications from the Egyptian Drug Authority (EDA)
          </p>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  Database Status: {databaseStatus}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={handleRefresh}
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by trade name, generic name, or Company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Showing results for "{searchTerm}" - {totalDrugs} drugs found
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : drugs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {drugs.map((drug: Drug, index: number) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {drug.Drugname || drug['Drugname'] || 'N/A'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Company:</span> {drug.Company || drug['Company'] || 'N/A'}</p>
                      <p><span className="font-medium">Dosage Form:</span> {drug.Form || drug['Dosage Form'] || 'N/A'}</p>
                      {(drug.Category || drug['Active Ingredient']) && (
                        <p><span className="font-medium">Category :</span> {drug.Category || drug['Active Ingredient']}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages} ({totalDrugs} total drugs)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'No drugs found matching your search.' : 'No drugs available.'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}