const APIKEY = "086b7a82813cbca4523e8e7df13cf7c3";
const base = "https://api.themoviedb.org/3";
const imgsrc = "https://image.tmdb.org/t/p/w342";
const queryInput = document.getElementById("query");
const typeSelect = document.getElementById("type");
const message = document.getElementById("message");
const results = document.getElementById("results");
const details = document.getElementById("details");
document.getElementById("searchBtn").onclick = searchTitles;
queryInput.addEventListener("keydown", function (e)
{
    if (e.key === "Enter") searchTitles();
      });
function el(tag, className, text)
{
    const e = document.createElement(tag);
  if (className) e.className = className;
   if (text !== undefined) e.textContent = text;
    return e;
}
function getJSON(url, onSuccess)
{
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
      if (xhr.status === 200) {
                onSuccess(JSON.parse(xhr.responseText));
            } else {
           message.textContent = "Error " + xhr.status + ". Check your API key.";
            }
        }
    };
    xhr.send();
}
function searchTitles()
{
    const q = queryInput.value.trim();
    if (!q) {
      message.textContent = "Type a title to search.";
        return;
    }

    const type = typeSelect.value;   // "tv" or "movie"
    const url = base + "/search/" + type + "?api_key=" + APIKEY + "&query=" + encodeURIComponent(q);
    message.textContent = "Searching…";
    getJSON(url, function (data) {
        results.replaceChildren();   
        details.replaceChildren();   

 if (data.results.length === 0) {
            message.textContent = "Nothing found. Try another title.";
            return;
        }

        message.textContent = "";
     for (let i = 0; i < data.results.length; i++) {
            showCard(data.results[i], type);
        }
    });
}
function showCard(item, type) {
    
    const title = item.name || item.title;
    const year = (item.first_air_date || item.release_date || "").slice(0, 4);
    const col = el("div", "col");
    const card = el("div", "card h-100");


    if (item.poster_path) {
        const img = el("img", "card-img-top");
    img.src = imgsrc + item.poster_path;
    img.alt = title;
    card.appendChild(img);
    } else {
        card.appendChild(el("div", "no-poster"));
    }

    const body = el("div", "card-body d-flex flex-column");
    body.appendChild(el("h6", "", title + (year ? " (" + year + ")" : "")));

    const btn = el("button", "btn btn-plan btn-sm mt-auto", "Plan it");
    btn.onclick = function () {
        loadDetails(item.id, type);
    };
    body.appendChild(btn);

    card.appendChild(body);
    col.appendChild(card);
    results.appendChild(col);
}
function loadDetails(id, type)
{
    const url = base + "/" + type + "/" + id + "?api_key=" + APIKEY;

    getJSON(url, function (d) {
        let totalMin, info;
        let estimated = false;

        if (type === "tv")
             {
          
            let runtime = d.episode_run_time && d.episode_run_time[0];
            if (!runtime)
     {
        runtime = 45;
        estimated = true;
        }
            totalMin = d.number_of_episodes * runtime;
            info = d.number_of_seasons + " seasons · "
                 + d.number_of_episodes + " episodes · "
                 + runtime + " min each";
        }
         else 
            {
            totalMin = d.runtime || 0;
            info = "Runtime: " + totalMin + " min";
        }

        showDetails(d.name || d.title, info, totalMin, estimated);
    });
}
function showDetails(title, info, totalMin, estimated)
 {
    details.replaceChildren();

    const card = el("div", "card p-4 text-center");
    card.appendChild(el("h3", "", title));
    card.appendChild(el("p", "text-secondary mb-2", info));
    card.appendChild(el("div", "big-time", formatTime(totalMin)));

    if (estimated)
         {
        card.appendChild(el("p", "small text-secondary",
            "Episode length not available, estimated at 45 min."));
    }


 const row = el("div", "row justify-content-center align-items-center g-2 mt-2");
    row.appendChild(el("div", "col-auto", "I can watch"));

    const inputCol = el("div", "col-4 col-md-2");
    const perDay = el("input", "form-control");
    perDay.type = "number";
    perDay.value = 2;
    perDay.min = 0.5;
    perDay.step = 0.5;
    inputCol.appendChild(perDay);
    row.appendChild(inputCol);

    row.appendChild(el("div", "col-auto", "hours per day"));
    card.appendChild(row);

    const daysText = el("p", "mt-3 mb-0");
    card.appendChild(daysText);
    details.appendChild(card);

  
    function updateDays()
     {
        const hours = parseFloat(perDay.value);
        if (!hours || hours <= 0) return;
        const days = Math.ceil(totalMin / (hours * 60));
        daysText.textContent = "You will finish in " + days + (days === 1 ? " day." : " days.");
    }
    perDay.addEventListener("input", updateDays);
    updateDays();

    details.scrollIntoView({ behavior: "smooth" });
}

   function formatTime(min)
 {
    const days = Math.floor(min / 1440);
    const hours = Math.floor((min % 1440) / 60);
    const mins = min % 60;
        let text = "";
     if (days) text += days + (days === 1 ? " day " : " days ");
     if (hours) text += hours + (hours === 1 ? " hour " : " hours ");
     if (mins || !text) text += mins + " min";
    return text.trim();
}