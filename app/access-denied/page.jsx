import Link from 'next/link'

function AccessDeniedPage() {
  return (
    <main>
      <h1>Access denied</h1>
      <p>
        Your account isn&apos;t authorized to use this app. Only @astranova.org
        and @adastraschool.org emails are allowed
      </p>
      <Link href="/login">Back to login</Link>
    </main>
  )
}

export default AccessDeniedPage