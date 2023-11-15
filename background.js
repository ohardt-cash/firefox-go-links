browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        var goLinkKeyword = "";

        const url = new URL(details.url);
        /*
            basic case: http(s)://go/firefox-go-links
         */
        if (url.hostname === "go") {
            goLinkKeyword = url.pathname;
        } else {
            /*
                try catching go links that already got forwarded to Google search
                this happens when someone enters "go/firefox-go-links" into the searchbar and hits enter
             */
            const queryParams = new URLSearchParams(url.search);
            const queryParamValue = queryParams.get("q");
            if ( (url.hostname === "www.google.com" || url.hostname === "duckduckgo.com") &&
                queryParamValue && queryParamValue.startsWith("go/")) {

                const decodedQueryParam = decodeURIComponent(queryParamValue);
                const keywordMatch = decodedQueryParam.match(/go\/(.+)/);
                if (keywordMatch && keywordMatch.length > 1) {
                    goLinkKeyword = keywordMatch[1];
                }
            }

            // todo: catch more search engines like duckduckgo, etc
        }

        if (goLinkKeyword.startsWith("/")) {
            goLinkKeyword = goLinkKeyword.slice(1);
        }

        if (goLinkKeyword !== "") {
            const newURL = `https://go.sqprod.co/${goLinkKeyword}`;
            console.log(`firefox-go-links: redirecting to ${newURL}`);
            return {redirectUrl: newURL};
        }
    },
    {
        urls: ["<all_urls>"],
        types: ["main_frame"],
    },
    ["blocking"]
);
