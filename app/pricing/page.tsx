import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

const tiers = [
  {
    name: 'Basic',
    price: '$19.99',
    description: 'Essential tools for casual DFS players',
    features: [
      'Basic optimizer access',
      '100 AI credits per month',
      'Basic alerts',
      'Standard correlation matrix',
    ],
    highlighted: false,
    buttonText: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$49.99',
    description: 'Advanced features for serious players',
    features: [
      'Advanced optimizer with custom rules',
      '500 AI credits per month',
      'Priority alerts',
      'Advanced correlation analysis',
      'Social sentiment tracking',
      'Weather impact analysis',
    ],
    highlighted: true,
    buttonText: 'Upgrade to Pro',
  },
  {
    name: 'Elite',
    price: '$99.99',
    description: 'Maximum edge for professional players',
    features: [
      'Unlimited optimizer access',
      'Unlimited AI credits',
      'Real-time alerts',
      'Premium correlation tools',
      'Advanced social tracking',
      'Custom player projections',
      'Priority support',
    ],
    highlighted: false,
    buttonText: 'Go Elite',
  },
];

const seasonalTiers = [
  {
    name: 'NFL Season',
    price: '$199.99',
    description: 'Full NFL season access',
    features: [
      'All Elite features',
      'Season-long projections',
      'Historical data access',
      'Playoff coverage',
    ],
    highlighted: true,
    buttonText: 'Get Season Pass',
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Select the perfect plan for your DFS strategy
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-12">
        {tiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col ${tier.highlighted ? 'border-primary shadow-lg' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {tier.name}
                {tier.highlighted && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Popular
                  </span>
                )}
              </CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                    {feature.includes('AI credits') && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Credits are used for AI assistant interactions and analysis</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={tier.highlighted ? 'default' : 'outline'}>
                {tier.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Seasonal Plans</h2>
        <div className="max-w-md mx-auto">
          {seasonalTiers.map((tier) => (
            <Card key={tier.name} className={`${tier.highlighted ? 'border-primary shadow-lg' : ''}`}>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">/season</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={tier.highlighted ? 'default' : 'outline'}>
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}