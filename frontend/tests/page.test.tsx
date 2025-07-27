import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../src/app/page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock the GraphQL fetcher
jest.mock('../src/lib/graphql', () => ({
  useUsers: () => ({
    queryKey: ['users'],
    queryFn: () => ({
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ],
    }),
  }),
  useSendKudos: () => ({
    sendKudos: jest.fn().mockResolvedValue({
      sendKudos: {
        id: '1',
        message: 'Great job!',
        sender: { id: '1', name: 'John Doe' },
        receiver: { id: '2', name: 'Jane Smith' },
        createdAt: new Date().toISOString(),
      },
    }),
  }),
}))

describe('Home Page', () => {
  const queryClient = new QueryClient()

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    )

  it('renders the page title', () => {
    renderPage()
    expect(screen.getByText('Peer Bonus')).toBeInTheDocument()
  })

  it('displays the send kudos form', () => {
    renderPage()
    expect(screen.getByText('Send Kudos')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Select a teammate')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Say something nice...')).toBeInTheDocument()
    expect(screen.getByText('Send Kudos')).toBeInTheDocument()
  })

  it('shows team members', async () => {
    renderPage()
    expect(await screen.findByText('Team Members')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })
})
