import { Helmet } from "react-helmet";

export default function JoinWaitlist() {
  return (
    <>
      <div className="flex h-screen items-center justify-center flex-col">
        <img
          src="/mellow-balloon.png"
          alt="Mellow"
          className="w-12 relative top-5"
        />
        <div
          id="getWaitlistContainer"
          data-waitlist_id="25333"
          data-widget_type="WIDGET_1"
          className="mx-auto"
          style={{ width: "500px" }}
        ></div>
      </div>
      <Helmet>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.css"
        />
        <script src="https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.js"></script>
      </Helmet>
    </>
  );
}
