'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Search, LineChart as ChartIcon, AlertCircle, Zap } from 'lucide-react';

// Mock data - would come from your credits tracking service
const mockUsageData = [
  { date: '2024-01-15', ai: 5, analysis: 3, correlation: 2, alerts: 1 },
  { date: '2024-01-16', ai: 3, analysis: 2, correlation: 4, alerts: 2 },
  { date: '2024-01-17', ai: 7, analysis: 1, correlation: 3, alerts: 1 },
  { date: '2024-01-18', ai: 4, analysis: 4, correlation: 1, alerts: 3 },
  { date: '2024-01-19', ai: 6, analysis: 2, correlation: 2, alerts: 2 }
];

const creditCosts = {
  ai: {
    name: 'AI Assistant',
    icon: Brain,
    costs: {
      'Basic Question': 1,
      'Strategy Analysis': 2,
      'Custom Correlation': 3,
      'Multi-Game Analysis': 4
    }
  },
  analysis: {
    name: 'Advanced Analysis',
    icon: ChartIcon,
    costs: {
      'Weather Impact': 2,
      'Beat Writer Analysis': 2,
      'Ownership Projections': 3,
      'Game Script Analysis': 3
    }
  },
  correlation: {
    name: 'Custom Correlations',
    icon: Search,
    costs: {
      'Basic Stack': 1,
      'Advanced Stack': 2,
      'Multi-Game Stack': 3,
      'Custom Rules': 4
    }
  },
  alerts: {
    name: 'Smart Alerts',
    icon: AlertCircle,
    costs: {
      'Basic Alert': 1,
      'Custom Threshold': 2,
      'Multi-Factor Alert': 3,
      'AI-Enhanced Alert': 4
    }
  }
};

export default function CreditsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const totalCredits = 50;
  const usedCredits = 23;
  const remainingCredits = totalCredits - usedCredits;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Credits Dashboard</h1>
        <Button>
          <Zap className="mr-2 h-4 w-4" />
          Buy More Credits
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <Progress 
              value={(usedCredits / totalCredits) * 100} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {remainingCredits} credits remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Queries</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockUsageData.reduce((sum, day) => sum + day.ai, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Most used feature
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analysis Credits</CardTitle>
            <ChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockUsageData.reduce((sum, day) => sum + day.analysis, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Second most used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewal Date</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Feb 1</div>
            <p className="text-xs text-muted-foreground mt-2">
              Credits renew in 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Usage Overview</TabsTrigger>
          <TabsTrigger value="costs">Credit Costs</TabsTrigger>
          <TabsTrigger value="history">Usage History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credits Usage Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockUsageData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ai" stroke="#8884d8" name="AI Queries" />
                    <Line type="monotone" dataKey="analysis" stroke="#82ca9d" name="Analysis" />
                    <Line type="monotone" dataKey="correlation" stroke="#ffc658" name="Correlations" />
                    <Line type="monotone" dataKey="alerts" stroke="#ff7300" name="Alerts" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(creditCosts).map(([key, category]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {Object.entries(category.costs).map(([action, cost]) => (
                      <li key={action} className="flex justify-between items-center">
                        <span>{action}</span>
                        <Badge variant="secondary">
                          {cost} {cost === 1 ? 'credit' : 'credits'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {mockUsageData.map((day) => (
                  <div key={day.date} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{day.date}</h4>
                      <span className="text-sm text-muted-foreground">
                        {Object.values(day).reduce((a, b) => a + b, 0)} credits used
                      </span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(day).map(([key, value]) => {
                        if (key === 'date') return null;
                        return (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {creditCosts[key].name}
                            </span>
                            <span>{value} credits</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}