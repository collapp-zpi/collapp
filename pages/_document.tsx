import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;700&display=swap"
            rel="stylesheet"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.smartlook||(function(d) {
                  var o=smartlook=function(){ o.api.push(arguments)},h=d.getElementsByTagName('head')[0];
                  var c=d.createElement('script');o.api=new Array();c.async=true;c.type='text/javascript';
                  c.charset='utf-8';c.src='https://rec.smartlook.com/recorder.js';h.appendChild(c);
                  })(document);
                  smartlook('init', '0d6bebf7a01eb89a2c2685d1d46723b6a276d31e');`,
            }}
          ></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
