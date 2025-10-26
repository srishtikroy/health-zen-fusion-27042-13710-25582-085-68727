// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, Upload, AlertCircle, Calendar, Plus, Trash2, Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Medicine {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  expiry_date: string;
  stock_remaining: number | null;
  notes: string | null;
}

const Medicine = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Form fields
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [stock, setStock] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await fetchMedicines(session.user.id);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
        fetchMedicines(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchMedicines = async (userId: string) => {
    try {
      // @ts-ignore - Types will regenerate
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('user_id', userId)
        .order('expiry_date', { ascending: true });

      if (error) throw error;
      setMedicines(data || []);
      
      // Check for expiring medicines and show notifications
      if (data && data.length > 0) {
        const urgentMedicines = data.filter((medicine: Medicine) => {
          const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry_date);
          return daysUntilExpiry >= 0 && daysUntilExpiry < 5;
        });
        
        if (urgentMedicines.length > 0) {
          urgentMedicines.forEach((medicine: Medicine) => {
            const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry_date);
            toast.error(
              `🚨 URGENT ALERT: ${medicine.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}!`,
              { 
                duration: 15000,
                style: {
                  background: 'hsl(var(--destructive))',
                  color: 'hsl(var(--destructive-foreground))',
                  border: '2px solid hsl(var(--destructive))',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }
              }
            );
          });
        }
      }
    } catch (error: any) {
      console.error('Error fetching medicines:', error);
      toast.error("Failed to load medicines");
    }
  };

  const parseExpiryDate = (text: string): string | null => {
    // Try to find date patterns like "Exp. Date : 4 MAR 2030" or "04/03/2030"
    const patterns = [
      // Pattern: "Exp. Date : 4 MAR 2030" or "Exp: 4 MAR 2030" - allow for "Date" word in between
      /(?:exp|expiry|expires)[:\s.]*(?:date)?[:\s.]*(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i,
      // Pattern: "04/03/2030" or "04-03-2030"
      /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/,
      // Pattern: "2030-03-04" or "2030/03/04"
      /(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (pattern === patterns[0]) {
          // Month name format: "4 MAR 2030"
          const day = match[1].padStart(2, '0');
          const monthMap: {[key: string]: string} = {
            'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
            'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
            'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
          };
          const month = monthMap[match[2].toLowerCase().substring(0, 3)];
          const year = match[3];
          return `${year}-${month}-${day}`;
        } else if (pattern === patterns[1]) {
          // DD/MM/YYYY format
          const day = match[1].padStart(2, '0');
          const month = match[2].padStart(2, '0');
          const year = match[3];
          return `${year}-${month}-${day}`;
        } else if (pattern === patterns[2]) {
          // YYYY-MM-DD format (already correct)
          const year = match[1];
          const month = match[2].padStart(2, '0');
          const day = match[3].padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      }
    }
    return null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setExtractedText("");
    toast.success("Image uploaded! Running OCR...");

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const imageBase64 = reader.result as string;
        const { data, error } = await supabase.functions.invoke('extract-text', {
          body: { imageBase64 }
        });

        if (error) throw error;
        const text: string = data?.text || "";
        console.log('OCR extracted text:', text);
        setExtractedText(text);

        // Parse and auto-fill expiry date
        const parsedDate = parseExpiryDate(text);
        console.log('Parsed expiry date:', parsedDate);
        if (parsedDate) {
          setExpiryDate(parsedDate);
          toast.success(`Auto-filled expiry date: ${parsedDate}`);
        } else {
          console.log('Could not parse expiry date from text');
          toast.info("OCR complete. Could not detect expiry date format. Please enter manually.");
        }

        // Try to detect medicine name from first meaningful line
        const lines = text.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed.length > 2 && 
                 !trimmed.toLowerCase().includes('select') &&
                 !trimmed.match(/^\d+$/);
        });
        
        if (lines.length > 0 && !medicineName) {
          const firstLine = lines[0].trim().substring(0, 100);
          setMedicineName(firstLine);
          toast.success(`Auto-filled medicine name: ${firstLine}`);
        }
      } catch (e: any) {
        console.error("OCR error:", e);
        toast.error(e.message || "Failed to extract text from image");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleAddMedicine = async () => {
    console.log('Add Medicine clicked', { user, medicineName, expiryDate });
    
    if (!user) {
      toast.error("Please log in to add medicines");
      return;
    }

    if (!medicineName.trim()) {
      toast.error("Please enter medicine name");
      return;
    }

    if (!expiryDate) {
      toast.error("Please enter expiry date");
      return;
    }

    try {
      // @ts-ignore - Types will regenerate
      const { data, error } = await supabase
        .from('medicines')
        .insert({
          user_id: user.id,
          name: medicineName.trim(),
          dosage: dosage.trim() || null,
          frequency: frequency.trim() || null,
          expiry_date: expiryDate,
          stock_remaining: stock ? parseInt(stock) : null,
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setMedicines([...medicines, data]);
      
      // Reset form
      setMedicineName("");
      setDosage("");
      setFrequency("");
      setExpiryDate("");
      setStock("");
      setNotes("");
      setSelectedFile(null);
      setExtractedText("");

      toast.success("Medicine added successfully!");
    } catch (error: any) {
      console.error('Error adding medicine:', error);
      toast.error("Failed to add medicine");
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;

    try {
      // @ts-ignore - Types will regenerate
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMedicines(medicines.filter(m => m.id !== id));
      toast.success("Medicine deleted");
    } catch (error: any) {
      console.error('Error deleting medicine:', error);
      toast.error("Failed to delete medicine");
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    if (daysUntilExpiry < 0) return { text: "Expired!", color: "text-destructive", bgColor: "bg-destructive/10" };
    if (daysUntilExpiry < 5) return { text: "Urgent!", color: "text-destructive", bgColor: "bg-destructive/10" };
    if (daysUntilExpiry < 15) return { text: "Check Soon", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-950" };
    if (daysUntilExpiry <= 30) return { text: "Good", color: "text-primary", bgColor: "bg-primary/10" };
    return { text: "Good", color: "text-primary", bgColor: "bg-primary/10" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      {/* Header */}
      <section className="bg-[image:var(--wellness-gradient)] text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Medicine Manager
          </h1>
          <p className="text-lg opacity-90">
            Track your medications and never miss expiry dates
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 space-y-6">
        {/* Urgent Expiry Alert Banner */}
        {medicines.filter(m => {
          const days = getDaysUntilExpiry(m.expiry_date);
          return days >= 0 && days < 5;
        }).length > 0 && (
          <div className="bg-destructive text-destructive-foreground rounded-lg p-6 shadow-lg border-2 border-destructive animate-pulse">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Bell className="h-8 w-8 animate-bounce" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  🚨 URGENT MEDICINE EXPIRY ALERTS
                </h3>
                <div className="space-y-2">
                  {medicines
                    .filter(m => {
                      const days = getDaysUntilExpiry(m.expiry_date);
                      return days >= 0 && days < 5;
                    })
                    .map((medicine) => {
                      const daysLeft = getDaysUntilExpiry(medicine.expiry_date);
                      return (
                        <div key={medicine.id} className="bg-destructive-foreground/10 rounded p-3 font-semibold text-base">
                          ⚠️ <strong>{medicine.name}</strong> expires in{" "}
                          <span className="text-xl font-bold underline">{daysLeft}</span>{" "}
                          day{daysLeft !== 1 ? 's' : ''} ({medicine.expiry_date})
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload & Add Medicine */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add Medicine
            </CardTitle>
            <CardDescription>
              Upload a photo or enter details manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Upload Medicine Photo</p>
                  <p className="text-sm text-muted-foreground">
                    We'll try to detect the expiry date automatically
                  </p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="max-w-xs"
                />
                {selectedFile && (
                  <p className="text-sm text-primary">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            {extractedText && (
              <div className="rounded-lg border border-border p-4 bg-muted/40 text-left">
                <p className="text-sm font-medium mb-2">OCR Result</p>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{extractedText}</p>
              </div>
            )}

            {/* Manual Entry Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicine-name">Medicine Name *</Label>
                <Input 
                  id="medicine-name" 
                  placeholder="e.g., Vitamin C"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input 
                  id="dosage" 
                  placeholder="e.g., 500mg"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input 
                  id="frequency" 
                  placeholder="e.g., Twice daily"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry-date">Expiry Date *</Label>
                <Input 
                  id="expiry-date" 
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Remaining</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  placeholder="30"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input 
                  id="notes" 
                  placeholder="Additional info"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddMedicine} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Medicine
            </Button>
          </CardContent>
        </Card>

        {/* Medicine List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Your Medicines ({medicines.length})
            </CardTitle>
            <CardDescription>Track expiry dates and stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            {medicines.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No medicines added yet. Add your first medicine above!
              </p>
            ) : (
              <div className="space-y-4">
                {medicines.map((medicine) => {
                  const status = getExpiryStatus(medicine.expiry_date);
                  const daysLeft = getDaysUntilExpiry(medicine.expiry_date);
                  return (
                    <div
                      key={medicine.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[image:var(--wellness-gradient)]">
                          <Pill className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{medicine.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {medicine.dosage && `${medicine.dosage} • `}
                            {medicine.frequency || 'As needed'}
                          </p>
                          {medicine.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{medicine.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 md:gap-8">
                        {medicine.stock_remaining !== null && (
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Stock</p>
                            <p className="font-semibold">{medicine.stock_remaining}</p>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Expiry Date</p>
                          <p className="text-sm font-medium">{medicine.expiry_date}</p>
                          <p className="text-xs text-muted-foreground">
                            {daysLeft >= 0 ? `${daysLeft} days left` : `Expired ${Math.abs(daysLeft)} days ago`}
                          </p>
                        </div>
                        
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${status.bgColor}`}>
                          <AlertCircle className={`h-5 w-5 ${status.color}`} />
                          <span className={`font-semibold text-sm ${status.color}`}>
                            {status.text}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminders Info */}
        <Card className="bg-muted border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Smart Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Automatic alerts and status indicators based on expiry dates:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span><strong className="text-destructive">Urgent!</strong> - Less than 5 days (notification alert shown on login)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-600" />
                <span><strong className="text-yellow-600">Check Soon</strong> - Less than 15 days until expiry</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span><strong className="text-primary">Good</strong> - More than 30 days until expiry</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Medicine;
