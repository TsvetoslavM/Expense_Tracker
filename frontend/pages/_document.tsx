import { Html, Head, Main, NextScript } from 'next/document'
import type { DocumentProps } from 'next/document'

export default function Document(props: DocumentProps) {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/money.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 