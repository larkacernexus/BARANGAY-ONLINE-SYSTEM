import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stat {
  label: string;
  value: number;
}

interface UsersStatsProps {
  stats: Stat[];
}

export default function UsersStats({ stats }: UsersStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}