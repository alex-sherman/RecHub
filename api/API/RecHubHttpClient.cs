using Replicate.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace API {
    public interface IRecHubHttpClient {
        Task<HttpResponseMessage> DoAsync(HttpMethod method, string url, Dictionary<string, string> values);
    }
    public class RecHubHttpClient : IRecHubHttpClient {
        HttpClient httpClient = new HttpClient();
        JSONSerializer Serializer;
        const string BASE_URL = "https://lessons.hoofersailing.org/";
        public RecHubHttpClient(JSONSerializer serializer) {
            Serializer = serializer;
        }
        public async Task<HttpResponseMessage> DoAsync(HttpMethod method, string url, Dictionary<string, string> values) {
            url = BASE_URL + url;
            if (method == HttpMethod.Post)
                return await httpClient.PostAsync(url, new FormUrlEncodedContent(values));
            if (method == HttpMethod.Get) {
                var query = string.Join('&', values.Select(kvp => $"{HttpUtility.UrlEncode(kvp.Key)}={HttpUtility.UrlEncode(kvp.Value)}"));
                return await httpClient.GetAsync($"{url}?{query}");
            }
            throw new NotImplementedException();
        }
    }
}
