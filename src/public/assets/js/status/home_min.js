var pageUrl = DOMPurify.sanitize(window.location.href.replace(location.search, '').replace(/\/$/, '')),
	favicon = new Favico({ animation: 'popFade', position: 'up' }),
	pspi = $('input#pspi').val();
function callMonitorList(t, s) {
	void 0 === t && (t = 1);
	$.ajax({
		type: 'GET',
		url: pspApiPath + '?page=' + t,
		dataType: 'json',
		cache: !1,
		success: function (a) {
			var i = a.statistics.counts.down,
				e = a.statistics.counts.up,
				o = a.statistics.counts.paused,
				n = (a.statistics.counts.total, a.psp.totalMonitors);
			try {
				var l = localStorage.getItem("PSPStatusUp['" + pspi + "'']") || null,
					p = localStorage.getItem("PSPStatusDown['" + pspi + "'']") || null;
				localStorage.setItem("PSPStatusUp['" + pspi + "'']", e),
					localStorage.setItem("PSPStatusDown['" + pspi + "'']", i);
			} catch (t) {
				(l = window.oldStatusUp), (p = window.oldStatusDown);
				(window.oldStatusUp = e), (window.oldStatusDown = i);
			}
			var r = !1;
			(l == e && p == i) || (r = !0),
				$('#totalCount').text(n),
				$('#upCount').text(e),
				$('#downCount').text(i),
				$('#pausedCount').text(o),
				(window.timeZone = a.psp.timezone),
				$('.psp-main-status-dot').removeClass('is-grey is-error is-warning'),
				0 == i && o != n
					? $('.psp-main-status').html('All systems <span class="uk-text-primary">operational</span>')
					: 0 == e && 0 == o
					? ($('.psp-main-status-dot').addClass('is-error'),
					  $('.psp-main-status').html('All systems <span class="uk-text-danger">down</span>'),
					  playAlertSound())
					: 0 != i && o != n
					? ($('.psp-main-status-dot').addClass('is-warning'),
					  $('.psp-main-status').html('Some systems down'),
					  playAlertSound())
					: o == n &&
					  ($('.psp-main-status-dot').addClass('is-grey'),
					  $('.psp-main-status').html('System is not monitored'));
			var d = '';
			if (o == n)
				$('.psp-monitor-list').html('<div class="uk-text-center uk-text-muted">All monitors are paused!</div>');
			else {
				var c = a.days.reverse();
				if (window.showB) var u = window.innerWidth;
				var m = 90,
					w = window.compact ? 530 : 880,
					v = window.compact ? 15 : 30,
					h = window.compact ? 5.9 : 9.8,
					f = window.compact ? 3.25 : 6;
				u <= 768 && ((m = 30), (h = 19.8), (f = 12), (w = 588), (v = window.compact ? 30 : 60)),
					$('.psp-day-number').text(m),
					$.each(a.psp.monitors, function (t, s) {
						if (window.hidePM && 'black' == s.statusClass);
						else {
							var a = '',
								i = '';
							if (window.showB) {
								var e = 90 - m,
									o = s.dailyRatios.reverse();
								for (t = e; t < 90; t++) {
									var n = o[t],
										l = new Date(c[t]).getTime() / 1e3,
										p = n.ratio + '%',
										r = '#3bd671',
										u = '1';
									1 == l < s.createdAt - 86400 || 'black' == n.label
										? ((r = '#687790'), (p = 'No Records'))
										: n.ratio < 100 && n.ratio >= 99
										? ((r = '#3bd671'), (u = '0.5'))
										: n.ratio < 99 && n.ratio >= 95
										? (r = '#f29030')
										: n.ratio < 95 && (r = '#df484a'),
										(i +=
											'<rect height="' +
											v +
											'" width="' +
											f +
											'" x="' +
											(t - e) * h +
											'" y="0" fill="' +
											r +
											'" fill-opacity="' +
											u +
											'" rx="' +
											f / 2 +
											'" ry="' +
											f / 2 +
											'" uk-tooltip="<div class=\'uk-text-muted font-12\'>' +
											c[t] +
											'</div>                                ' +
											p +
											'" />');
									var k =
										'                                    <div class="psp-charts uk-margin-small-top uk-flex uk-flex-middle">                                        <svg width="' +
										w +
										'" height="' +
										v +
										'" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ' +
										w +
										' ' +
										v +
										'">                                        ' +
										i +
										'                                        </svg>                                    </div>';
								}
							}
							'success' == s.statusClass
								? ((a =
										'<div class="uk-text-primary" title="Operational"><span class="dot" aria-hidden="true"></span><span class="uk-visible@s m-l-10">'),
								  (a += window.compact ? 'Up' : 'Operational'),
								  (a += '</span></div>'))
								: 'danger' == s.statusClass
								? (a =
										'<div class="uk-text-danger" title="Down"><span class="dot is-error" aria-hidden="true"></span><span class="uk-visible@s m-l-10">Down</span></div>')
								: ((a =
										'<div class="uk-text-muted" title="Not monitored"><span class="dot is-grey" aria-hidden="true"></span><span class="uk-visible@s m-l-10">'),
								  (a += window.compact ? 'N/A' : 'Not monitored'),
								  (a += '</span></div>')),
								(d +=
									'                            <div class="psp-monitor-row">                                <div class="uk-flex uk-flex-between uk-flex-wrap">'),
								window.compact
									? (d +=
											'<div class="psp-monitor-row-header uk-text-muted uk-flex uk-flex-auto uk-flex-between">')
									: (d += '<div class="psp-monitor-row-header uk-text-muted uk-flex uk-flex-auto">'),
								window.enableD
									? (d +=
											'<a title="' +
											s.name +
											'" class="psp-monitor-name uk-text-truncate uk-display-inline-block" href="' +
											pageUrl +
											'/' +
											s.monitorId +
											'">                                            ' +
											s.name +
											'                                            <svg class="icon icon-plus-square uk-flex-none"><use xlink:href="/assets/symbol-defs.svg#icon-arrow-right"></use></svg>                                            </a>')
									: (d +=
											'<span class="psp-monitor-name uk-text-truncate uk-display-inline-block">' +
											s.name +
											'</span>'),
								(d += '<div class="uk-flex-none">'),
								window.showUP &&
									(window.compact || (d += '<span class="m-r-5 m-l-5 uk-visible@s">|</span>'),
									(d +=
										'<span class="uk-text-primary uk-visible@s">' +
										s[m + 'dRatio'].ratio +
										'%</span>')),
								null !== s.url &&
									('Heartbeat' !== s.type
										? (d +=
												'<svg class="icon icon-help-circle font-12 uk-flex-none uk-visible@s" uk-tooltip title="<div class=\'uk-text-muted font-12\'>' +
												s.type +
												"</div><div class='font-12'>" +
												s.url +
												'</div>"><use xlink:href="/assets/symbol-defs.svg#icon-help-circle"></use></svg>')
										: (d +=
												'<svg class="icon icon-help-circle font-12 uk-flex-none" uk-tooltip title="<div class=\'uk-text-muted font-12\'>' +
												s.type +
												'</div>"><use xlink:href="/assets/symbol-defs.svg#icon-help-circle"></use></svg>')),
								(d +=
									'                                            <div class="uk-hidden@s uk-margin-small-left">' +
									a +
									'</div>                                        </div>                                    </div>'),
								window.showB && window.compact && (d += k),
								(d += '<div class="psp-monitor-row-status uk-visible@s">' + a + '</div>'),
								window.showUP &&
									(d +=
										'<div class="uk-hidden@s uk-text-primary">' + s['30dRatio'].ratio + '%</div>'),
								(d += '</div>'),
								window.showB && !window.compact && (d += k),
								(d += '</div>');
						}
					}),
					$('.psp-monitor-list').html(d);
			}
			if (
				($('.psp-monitor-preloader').addClass('uk-hidden'),
				$('.psp-calendar-link').attr('href', pageUrl + '/' + a.psp.monitors[0].monitorId + '/calendar'),
				$('.psp-history-link').attr('href', pageUrl + '/history'),
				null !== a.statistics.latest_downtime && window.showO)
			) {
				var k = a.statistics.latest_downtime;
				$('.psp-latest-downtime').html(
					'<a href="' + pageUrl + '/' + k.monitorID + '#logs">Latest downtime</a> detected ' + k.ago + '.'
				);
			}
			if (
				(0 == window.showO && $('.outage-days').text('30'),
				s
					? (callEventFeed(!1, null, null), initFaviconBadge(i))
					: r && (callEventFeed(!0, null, null), initFaviconBadge(i)),
				a.psp.totalMonitors > a.psp.perPage)
			) {
				var g = Math.ceil(a.psp.totalMonitors / a.psp.perPage),
					x = 50,
					y = 1,
					b = '<ul class="uk-pagination uk-flex-center">',
					S = t,
					P = S + 1,
					C = 1 == S ? 'uk-disabled' : '';
				(b += '<li class="' + C + '"><a href="#" data-page="1">«</a></li>'),
					(b +=
						'<li class="' + C + '"><a href="#" data-page="' + (1 == S ? 1 : S - 1) + '">&lsaquo;</a></li>'),
					g < x ? (x = g) : S > 5 && (x = (y = S - 5) + (x - 1)) > g && (x = g);
				for (var D = y; D <= x; D++) {
					b +=
						'<li class="' +
						(S == D ? 'uk-active' : '') +
						'"><a href="#" data-page="' +
						D +
						'">' +
						D +
						'</a></li>';
				}
				(b +=
					'<li class="' +
					(C = S == g ? 'uk-disabled' : '') +
					'"><a href="#" data-page="' +
					P +
					'">&rsaquo;</a></li>'),
					(b += '<li class="' + C + '"><a href="#" data-page="' + g + '">»</a></ul>'),
					$('.psp-monitor-pagination').html(b);
			}
			if (a.statistics.uptime) {
				var U = 1;
				$.each(a.statistics.uptime, function (t, s) {
					$('#overall-uptime div:nth-child(' + U + ') h3')
						.addClass(s.label)
						.html(s.ratio + '%'),
						U++;
				});
			}
		},
		error: function (t) {
			console.log(t);
		},
	});
}
function initFaviconBadge(t) {
	t > 0 ? favicon.badge(t) : favicon.reset();
}
$(function () {
	setInterval(() => countdown(), 1e3);
	$('.last-updated').text(new Date().toLocaleTimeString()),
		callMonitorList(1, !0),
		$('.psp-monitor-pagination').on('click', 'a', function (t) {
			$('.psp-monitor-list').html(''), $('.psp-monitor-preloader').removeClass('uk-hidden'), t.preventDefault();
			var s = parseInt($(this).data('page'));
			return (
				$('.psp-monitor-pagination').attr('data-page', s),
				callMonitorList(s, !1),
				$('html, body').animate({ scrollTop: $('#monitors').offset().top - 50 }, 200),
				!1
			);
		});
});
//# sourceMappingURL=home.min.js.map
