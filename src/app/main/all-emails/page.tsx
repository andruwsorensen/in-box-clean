import Layout from '@/components/layout'
import EmailList from '@/components/email-list'

export default function EmailsPage() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">All Emails</h1>
      <EmailList />
    </Layout>
  )
}