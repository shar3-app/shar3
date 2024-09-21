const ReloadWarning = () => (
  <>
    <div data-icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        height="20"
        width="20"
      >
        <path
          fillRule="evenodd"
          d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        ></path>
      </svg>
    </div>
    <div data-content>
      <div data-title>
        Looks like something went wrong.{' '}
        <span className="underline cursor-pointer" onClick={async () => window.location.reload()}>
          Click to reload the app.
        </span>
      </div>
    </div>
  </>
);

export default ReloadWarning;
