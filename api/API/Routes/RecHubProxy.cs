using Replicate;
using Replicate.Serialization;
using Replicate.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace API.Routes {
    public class RouteData {
        public string Route;
        public HttpMethod Method = HttpMethod.Get;
        public Dictionary<string, string> KeyMap = new Dictionary<string, string>();
        public List<(string key, string value)> ExtraKeys = new List<(string key, string value)>();
        public bool AllowCaching = false;
        private Dictionary<string, HttpResponseMessage> cache = new Dictionary<string, HttpResponseMessage>();
        public async Task<HttpResponseMessage> Request(IRecHubHttpClient http, Dictionary<string, string> form) {
            var cacheKey = string.Join(null, form.OrderBy(kvp => kvp.Key));
            if (AllowCaching && cache.TryGetValue(cacheKey, out var response)) return response;
            form = form ?? new Dictionary<string, string>();
            form = form.Concat(ExtraKeys.Select(t => KeyValuePair.Create(t.key, t.value)))
                .ToDictionary(k => KeyMap.TryGetValue(k.Key, out var newKey) ? newKey : k.Key, k => k.Value);
            var result = await http.DoAsync(Method, Route, form);
            if(AllowCaching) {
                cache[cacheKey] = result;
            }
            return result;
        }
    }
    [ReplicateType]
    [ReplicateRoute(Route = "api")]
    public class UserInterface : ReplicateWebRPC {
        static Dictionary<string, RouteData> Routes = new Dictionary<string, RouteData>() {
            ["login"] = new RouteData() {
                Route = "site/login",
                Method = HttpMethod.Post,
                KeyMap = { { "name", "LoginForm[username]" }, { "pasword", "LoginForm[password]" } },
                ExtraKeys = { ("yt0", "Login") },
            },
            ["events"] = new RouteData() {
                Route = "event/calendar/feed",
                ExtraKeys = { ("category[]", ""), ("club_ID[]", "") },
                AllowCaching = true,
            },
        };
        [FromDI]
        IRecHubHttpClient http;
        public UserInterface(IServiceProvider services) : base(services) { }
        [ReplicateRoute(Route = "{route}")]
        public async Task<Blob> RecHub(Dictionary<string, string> form) {
            var route = HttpContext.Request.RouteValues["route"] as string;
            if (!Routes.TryGetValue(route, out var routeData)) throw new HTTPError($"Route not found {route}", 404);
            var response = await routeData.Request(http, form);
            var responseStr = await response.Content.ReadAsStringAsync();
            if (response.Headers.TryGetValues("Set-Cookie", out var values)) {
                HttpContext.Response.Headers["Set-Cookie"] = values.ToArray();
            }
            return Blob.FromString(responseStr);
        }
    }
}
