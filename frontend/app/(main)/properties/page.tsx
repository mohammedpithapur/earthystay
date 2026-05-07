import React, { Suspense } from 'react'
import PropertiesClient from './PropertiesClient'

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}>Loading properties…</div>}>
      <PropertiesClient />
    </Suspense>
  )
}
                }
              }
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        </>
      )}
    </div>
  )
}