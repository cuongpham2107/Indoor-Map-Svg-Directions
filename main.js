document.addEventListener('alpine:init', () => {
    Alpine.data('svg', () => ({
        points: [],
        circle: document.getElementsByClassName('point'),
        start_point: '',
        end_point: '',
        hidden_start_point: '',
        hidden_end_point: '',
        openSearchStartPoint: false,
        openSearchEndPoint: false,
        directions: true,
        init() {
            for (let item of this.circle) {
                let cx = item.getAttribute('cx');
                let cy = item.getAttribute('cy');
                let title = item.getAttribute('title');
                let point = item.getAttribute('point');
                let target = item.getAttribute('target');
                let distance = item.getAttribute('distance');
                let neighbors = []
                if (target != null) {
                    let arrayTarget = target.split(",");
                    arrayTarget.forEach((a) => {
                        neighbors.push({
                            target: a,
                            distance: distance
                        })
                    })
                }
                this.points.push({
                    id: point,
                    name: title,
                    x: cx,
                    y: cy,
                    neighbors: [...neighbors]
                })
            }
            let urlParams = new URLSearchParams(window.location.search);
            let start_point_qr = this.points.find(p => p.id === urlParams.get('start_point')).name
            // console.log(start_point_qr)
            this.start_point = start_point_qr 
        },
        choosePointInMap(point) {
            if (!this.start_point) {
                this.start_point = this.points.find(p => p.id === point).name
            } else if (!this.end_point && this.start_point) {
                this.end_point = this.points.find(p => p.id === point).name
            }
        },
        swap() {
            let swap = '';
            swap = this.start_point
            this.start_point = this.end_point
            this.end_point = swap
        },
        get filteredStartPointItems() {
            return this.points;
        },
        chooseStartPoint(id) {
            this.points.map((p) => {
                if (p.id === id) {
                    this.start_point = p.name
                }
            })
            this.openSearchStartPoint = false
        },
        get filteredEndPointItems() {
            return this.points;
        },
        chooseEndPoint(id) {
            this.points.map((p) => {
                if (p.id === id) {
                    this.end_point = p.name
                }
            })
            this.openSearchEndPoint = false
        },
        drawLinePoint() {
            let self = this;
            // Lặp qua mảng neighbors của mỗi điểm và vẽ các đường line
            this.points.forEach(function(point) {
                point.neighbors.forEach(function(neighbor) {
                    var targetPoint = self.points.find(p => p.id === neighbor.target);
                    if (targetPoint) {
                        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                        line.setAttribute("x1", point.x);
                        line.setAttribute("y1", point.y);
                        line.setAttribute("x2", targetPoint.x);
                        line.setAttribute("y2", targetPoint.y);
                        line.setAttribute("stroke", "black");
                        document.getElementById('map').appendChild(line);
                    }
                });
            });
        },
        drawDirection() {
            let map = document.getElementById('map');
            // Lặp qua tất cả các phần tử con của container SVG
            Array.from(map.children).forEach(child => {
                // Kiểm tra xem phần tử con có phải là đường line không
                if (child.tagName === 'line' || child.tagName == 'image') {
                    // Nếu là đường line, loại bỏ phần tử này khỏi container SVG
                    map.removeChild(child);
                }
            });
            let pathFill = document.getElementsByClassName('path');
            for (let item of pathFill) {
                item.style.fill = "#6CC7DA"
            }
            try {
                if (this.start_point && this.end_point) {
                    var start = this.slugify(this.start_point);
                    var end = this.slugify(this.end_point);

                    if(start === end){
                        const path = this.shortestPath(this.points, start, end);
                        this.directions = false
                            //Vẽ đường line màu đỏ theo đường đi ngắn nhất
                        for (var i = 0; i < path.length - 1; i++) {
                            var startPoint = this.points.find(p => p.id === path[i]);
                            var endPoint = this.points.find(p => p.id === path[i + 1]);

                            if (startPoint.id === start) {
                                var startIcon = document.createElementNS("http://www.w3.org/2000/svg", "image");
                                startIcon.setAttribute("href", "image/placeholder.png");
                                startIcon.setAttribute("x", parseInt(startPoint.x) - 50);
                                startIcon.setAttribute("y", parseInt(startPoint.y) - 120);
                                startIcon.setAttribute("height", "128");
                                startIcon.setAttribute("width", "128"); // Độ lớn của biểu tượng
                                map.appendChild(startIcon);

                                var pathStart = document.getElementById(`${start}_2`);
                                pathStart.style.fill = "#3b82f6"
                                // console.log(pathStart)

                            }
                            if (endPoint.id === end) {
                                var endIcon = document.createElementNS("http://www.w3.org/2000/svg", "image");
                                endIcon.setAttribute("href", "image/checkered-flag.png");
                                endIcon.setAttribute("x", parseInt(endPoint.x) - 20);
                                endIcon.setAttribute("y", parseInt(endPoint.y) - 120);
                                endIcon.setAttribute("height", "128");
                                endIcon.setAttribute("width", "128"); // Độ lớn của biểu tượng
                                map.appendChild(endIcon);

                                var pathEnd = document.getElementById(`${end}_2`);
                                pathEnd.style.fill = "#3b82f6"
                            }



                            var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                            line.setAttribute("x1", startPoint.x);
                            line.setAttribute("y1", startPoint.y);
                            line.setAttribute("x2", endPoint.x);
                            line.setAttribute("y2", endPoint.y);
                            line.setAttribute("stroke", "#eab308");
                            line.setAttribute("stroke-dasharray", "30, 30");
                            line.setAttribute("stroke-width", "20");
                            map.appendChild(line);


                        }
                    }
                    else{
                        alert("Điểm bắt đầu và điểm kết thúc giống nhau")
                    }
                    
                } else {
                    alert("Chưa chọn điểm bắt đầu hoặc kết thúc");
                }
            } catch (error) {
                console.log(error)
            }



        },
        slugify(str) {
            // Chuyển hết sang chữ thường
            str = str.toLowerCase();

            // xóa dấu
            str = str
                .normalize('NFD') // chuyển chuỗi sang unicode tổ hợp
                .replace(/[\u0300-\u036f]/g, ''); // xóa các ký tự dấu sau khi tách tổ hợp

            // Thay ký tự đĐ
            str = str.replace(/[đĐ]/g, 'd');

            // Xóa ký tự đặc biệt
            str = str.replace(/([^0-9a-z-\s])/g, '');

            // Xóa khoảng trắng thay bằng ký tự -
            str = str.replace(/(\s+)/g, '-');

            // Xóa ký tự - liên tiếp
            str = str.replace(/-+/g, '-');

            // xóa phần dư - ở đầu & cuối
            str = str.replace(/^-+|-+$/g, '');

            // return
            return str;
        },
        shortestPath(graph, startNode, endNode) {
            try {
                const INF = Number.MAX_SAFE_INTEGER;
                const dist = {};
                const previous = {};
                const queue = [];

                graph.forEach(node => {
                    dist[node.id] = INF;
                    previous[node.id] = null;
                    queue.push(node.id);
                });

                dist[startNode] = 0;

                while (queue.length > 0) {
                    let u = queue.reduce((minNode, node) => {
                        return dist[node] < dist[minNode] ? node : minNode;
                    });

                    queue.splice(queue.indexOf(u), 1);

                    graph.filter(node => node.id === u)[0].neighbors.forEach(neighbor => {
                        let alt = dist[u] + neighbor.distance;
                        if (alt < dist[neighbor.target]) {
                            dist[neighbor.target] = alt;
                            previous[neighbor.target] = u;
                        }
                    });
                }

                let path = [];
                let u = endNode;
                while (previous[u] !== null) {
                    path.unshift(u);
                    u = previous[u];
                }
                path.unshift(startNode);

                return path;
            } catch (error) {
                console.log(error)
            }

        }
    }))
})

// A : {
//     target : {
//         ID: B,
//         distance: 100,
//         GO: 'thang'
//     },
//     target : {
//         ID: c,
//         distance: 50,
//         GO: 're phai'
//     },
// }