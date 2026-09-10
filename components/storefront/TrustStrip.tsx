import { ShieldCheck, Truck, RotateCcw, Banknote } from 'lucide-react'

export function TrustStrip() {
  const items = [
    {
      icon: Banknote,
      title: 'Cash on Delivery',
      desc: 'Pay after inspecting at doorstep',
      shortDesc: 'Pay upon doorstep delivery',
    },
    {
      icon: Truck,
      title: 'Nationwide Delivery',
      desc: '24-48h in Dhaka, 3-5 days outside',
      shortDesc: '24-48h Dhaka & nationwide',
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Returns',
      desc: 'Hassle-free replacement guarantee',
      shortDesc: '100% moneyback/swap guarantee',
    },
    {
      icon: ShieldCheck,
      title: '100% Quality Checked',
      desc: 'Verified before courier dispatch',
      shortDesc: 'Inspected before dispatch',
    },
  ]

  return (
    <div className="border-y border-gray-100 bg-gray-50/90 py-3 sm:py-4">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4 lg:gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="flex items-center gap-2 sm:gap-3 rounded-xl bg-white p-2.5 sm:p-3 border border-gray-100/80 shadow-2xs transition-all hover:border-emerald-200"
              >
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-900 leading-snug truncate">
                    {item.title}
                  </h4>
                  <p className="text-[9.5px] sm:text-[11px] text-gray-500 leading-tight mt-0.5 truncate">
                    {item.shortDesc}
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

