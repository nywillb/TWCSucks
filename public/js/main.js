$().ready(function () {
    $("#show-history").click(function () {
        $("#history-preview").addClass("hidden");
        $("#show-history").addClass("hidden");
        $("#history").removeClass("hidden");
    })

    $("#check-again").click(function () {
        $.get("/check", function () {
            location.reload();
        })
    })

    var ctx = document.getElementById("doughnut");
    var up = parseInt($("#up").text());
    var down = parseInt($("#down").text());
    var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ["Up", "Down"],
            datasets: [{
                label: "Last 30 Days",
                data: [up, down],
                backgroundColor: ["#18bc9c", "#e74c3c"]
            }],
        }
    });
})