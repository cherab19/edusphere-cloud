import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const books = [
  { id: 1, title: "Mathematics Grade 10", author: "Ministry of Education", copies: 25, available: 18 },
  { id: 2, title: "Physics Fundamentals", author: "Dr. Kebede A.", copies: 15, available: 3 },
  { id: 3, title: "English for Ethiopia", author: "MOE Press", copies: 30, available: 30 },
  { id: 4, title: "Biology Grade 12", author: "Science Publications", copies: 20, available: 12 },
  { id: 5, title: "History of Ethiopia", author: "Prof. Haile M.", copies: 10, available: 0 },
];

const LibraryPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Library</h1>
            <p className="text-muted-foreground text-sm">Manage books and borrowing</p>
          </div>
          <Button className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Add Book</Button>
        </div>

        <Card className="rounded-xl shadow-card">
          <div className="p-4 border-b border-border">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search books..." className="pl-10 h-10 rounded-lg" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Author</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total Copies</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Available</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" /> {b.title}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{b.author}</td>
                    <td className="py-3 px-4 text-muted-foreground">{b.copies}</td>
                    <td className="py-3 px-4 text-muted-foreground">{b.available}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`border-0 ${b.available > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {b.available > 0 ? "Available" : "All Borrowed"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LibraryPage;
