const ORDER_STEPS = [
  { status: 'PENDING', label: 'Pending' },
  { status: 'IN_PROGRESS', label: 'In progress' },
  { status: 'DELIVERED', label: 'Delivered' },
  { status: 'COMPLETED', label: 'Completed' },
]

export function OrderTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <section className="order-timeline order-timeline-cancelled" aria-label="Track order">
        <ol>
          <li className="order-timeline-step is-current" aria-current="step">
            <span className="order-timeline-marker" aria-hidden="true" />
            <span>Cancelled</span>
          </li>
        </ol>
      </section>
    )
  }

  const currentStepIndex = ORDER_STEPS.findIndex((step) => step.status === status)

  return (
    <section className="order-timeline" aria-label="Track order">
      <ol>
        {ORDER_STEPS.map((step, index) => {
          const isDone = currentStepIndex >= 0 && index <= currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <li
              key={step.status}
              className={[
                'order-timeline-step',
                isDone ? 'is-done' : '',
                isCurrent ? 'is-current' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="order-timeline-marker" aria-hidden="true" />
              <span>{step.label}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
