import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
} from '@react-email/components'

export const SignInTemplate = ({
  email,
  redirect,
}: {
  email: string
  redirect: string
}) => (
  <Html>
    <Head />
    <Preview>Sign in to Collapp</Preview>
    <Tailwind>
      <Body className="bg-gray-200 p-8 text-gray-600 font-sans">
        <Container className="bg-gray-50 max-w-3xl mx-auto p-8 rounded-3xl text-center">
          <Section>
            <Img
              src="https://collapp.sitarz.dev/logo.svg"
              className="h-12 w-12 mx-auto opacity-25 mb-4"
            />
            <h1 className="text-4xl font-bold text-blue-500 mb-12">
              Hello, there! 👋
            </h1>
            <div className="text-lg mb-4">
              Sign in as <strong>{email}</strong>
            </div>
            <Button
              href={redirect}
              className="px-6 py-3 bg-blue-500 mx-auto rounded-xl font-bold text-white cursor-pointer hover:bg-blue-600 shadow-xl transition-colors"
              target="_blank"
            >
              Sign in
            </Button>
          </Section>

          <div className="text-gray-400 text-xs mt-12">
            If you believe this email was delivered by mistake, you can safely
            ignore it.
          </div>
          <div className="text-gray-400 text-sm">
            Your friends at{' '}
            <a href="">
              <strong>Collapp</strong>
            </a>
          </div>
        </Container>
      </Body>
    </Tailwind>
  </Html>
)
