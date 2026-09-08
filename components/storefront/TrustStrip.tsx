import { ShieldCheck, Truck, RotateCcw, Banknote } from 'lucide-react'

export function TrustStrip() {
  const items = [
    {
      icon: Banknote,
      title: 'Cash on Delivery',
      desc: 'Pay at your doorstep after checking',
    },
    {
      icon: Truck,
      title: 'Nationwide Delivery',
      desc: '24-48h in Dhaka, 3-5 days outside',
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Returns',
      desc: 'Hassle-free replacement guarantee',
    },
    {
      icon: ShieldCheck,
      title: '100% Quality Checked',
      desc: 'Verified before courier dispatch',
    },
  ]

  return (
    <div className="border-y border-gray-100 bg-gray-50/80 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs border border-gray-200/60 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-tight mt-0.5 hidden sm:block">
                    {item.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
