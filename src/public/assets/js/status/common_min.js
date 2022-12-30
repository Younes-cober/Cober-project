function clearCountdown() {
	clearInterval(cInt);
}
function playAlertSound() {
	var e = $('input#pspi').val();
	try {
		localStorage.getItem("PSPNotification['" + e + "'']").toString();
	} catch (e) {}
	'1' == e && $('audio#notification')[0].play();
}
function formatDate(e) {
	var s = new Date(e),
		t = '' + (s.getMonth() + 1),
		n = '' + s.getDate(),
		a = s.getFullYear();
	return t.length < 2 && (t = '0' + t), n.length < 2 && (n = '0' + n), [a, t, n].join('-');
}
function generateAnnListItem(e, s) {
	var t = '',
		n = '';
	'alrt' == e.eventType
		? ((t = 'data-monitor-id="m-' + e.monitorID + '"'),
		  (t += 'data-date="d-' + formatDate(e.date) + '"'),
		  s &&
				$('.announcement-feed .psp-announcement[data-date=""]').lenght <= 30 &&
				$(
					'.announcement-feed[data-monitor-id="m-' + e.monitorID + '][data-date="' + formatDate(e.date) + '"]'
				).remove())
		: (n = ' is-' + e.icon);
	var a = '<div class="psp-announcement' + n + '" ' + t + '>';
	return (
		(a += '<div class="uk-flex uk-flex-middle uk-flex-wrap uk-margin-small-bottom">'),
		!0 === s && (a += '<div class="uk-label uk-label-small uk-margin-small-right">NEW</div>'),
		(a += '<div class="uk-text-muted uk-text-bold font-14">' + e.date + '</div>'),
		(a += '</div>'),
		(a += '<div class="uk-flex">'),
		'alrt' == e.eventType
			? ((a +=
					'<svg class="psp-announcement-icon icon icon-arrow-down-circle uk-flex-none"><use xlink:href="/assets/symbol-defs.svg#icon-arrow-down-circle"></use></svg>'),
			  (a += '<div class="uk-flex-auto">'),
			  (a +=
					'<h4 class="uk-margin-remove">' +
					e.monitor +
					' was down <span class="uk-text-muted">for ' +
					e.duration +
					' in total</span></h4>'),
			  1 == e.alertCount
					? (a += '<p>There was 1 outage during this day.</p>')
					: (a += '<p>There were ' + e.alertCount + ' outages during the day.</p>'),
			  (a += '<p class="uk-text-muted font-14">'),
			  window.enableD &&
					(a +=
						'<a href="' +
						pageUrl +
						'/' +
						e.monitorID +
						'#logs">See details<svg class="icon icon-plus-square m-l-5 font-14"><use xlink:href="/assets/symbol-defs.svg#icon-arrow-right"></use></svg></a> | '),
			  (a +=
					'<date uk-tooltip title="' +
					e.timeGMT +
					' GMT">            Updated on ' +
					e.time +
					' GMT' +
					window.timeZone +
					'        </date></p>'))
			: ((a +=
					'<svg class="psp-announcement-icon icon icon-' +
					e.icon +
					' uk-flex-none"><use xlink:href="/assets/symbol-defs.svg#icon-' +
					e.icon +
					'"></use></svg>'),
			  (a += '<div class="uk-flex-auto">'),
			  (a += '<h4 class="uk-margin-remove">' + e.title + '</h4>'),
			  (a += '<p>' + e.content + '</p>'),
			  null !== e.endDate
					? ((a += '<p class="uk-text-muted font-14">'),
					  (a +=
							'<span class="uk-display-inline-block" uk-tooltip title="' +
							e.timeGMT +
							' GMT">                ' +
							e.date +
							', ' +
							e.time +
							' GMT' +
							window.timeZone +
							'             </span>'),
					  (a +=
							'<span class="uk-display-inline-block" uk-tooltip title="' +
							e.endDateGMT +
							' GMT">                &nbsp;— ' +
							e.endDate +
							' GMT' +
							window.timeZone +
							'            </span>'),
					  (a += '</p>'))
					: (a +=
							'<p class="uk-text-muted font-14 uk-display-inline-block" uk-tooltip title="' +
							e.timeGMT +
							' GMT">                Updated on ' +
							e.time +
							' GMT' +
							window.timeZone +
							'            </p>')),
		(a += '</div></div></div>')
	);
}
function callEventFeed(e, s, t, n) {
	var a = '',
		o = 7;
	0 == window.showO && (o = 30);
	var r = ~~((parseFloat(Date.now()) - 864e5 * o) / 1e3);
	!0 === e && (r = ~~(parseFloat(Date.now() - 120) / 1e3)),
		null !== t && (r = ~~(parseFloat(t) / 1e3)),
		null !== s && (a = '&to_date=' + ~~(parseFloat(s) / 1e3)),
		void 0 !== n &&
			(n.html(
				'<div class="psp-fake-monitorname"></div><div class="psp-fake-uptime-bars"></div>            <div class="psp-fake-monitorname"></div>            <div class="psp-fake-uptime-bars"></div>            <div class="psp-fake-monitorname"></div>            <div class="psp-fake-uptime-bars"></div>'
			),
			$('.psp-calendar-nav').addClass('loading')),
		$.ajax({
			type: 'GET',
			url: eventsApiPath + '?from_date=' + r + a,
			dataType: 'json',
			cache: !1,
			success: function (s) {
				if (!0 === s.status)
					if (($('.announcement-feed-preloader').addClass('uk-hidden'), s.meta.count > 0)) {
						var t = Object.values(s.results).map(function (s) {
							return generateAnnListItem(s, e);
						});
						void 0 !== n
							? (n.html(t.join('')), $('.psp-calendar-nav').removeClass('loading'))
							: ($('.announcement-feed').prepend(t.join('')),
							  $('.announcement-last').removeClass('uk-hidden'),
							  e && $('.announcement-empty').addClass('uk-hidden'));
					} else
						void 0 !== n
							? (n.html('<div><em class="uk-text-muted">No updates for this date.</em></div>'),
							  $('.psp-calendar-nav').removeClass('loading'))
							: e || $('.announcement-empty').removeClass('uk-hidden');
			},
			error: function (e) {
				console.log(e);
			},
		});
}
function setCookie(e, s, t) {
	var n = new Date();
	n.setTime(n.getTime() + 24 * t * 60 * 60 * 1e3);
	var a = 'expires=' + n.toUTCString();
	document.cookie = e + '=' + s + ';' + a + ';path=/';
}
function getCookie(e) {
	for (var s = e + '=', t = decodeURIComponent(document.cookie).split(';'), n = 0; n < t.length; n++) {
		for (var a = t[n]; ' ' == a.charAt(0); ) a = a.substring(1);
		if (0 == a.indexOf(s)) return a.substring(s.length, a.length);
	}
	return null;
}
setTimeout(function () {
	window.location.reload(!0);
}, 36e5),
	$(function () {
		$('.enter-fullscreen').on('click', function () {
			var e = document.documentElement;
			0 == $(this).data('fullscreen')
				? (e.requestFullscreen
						? e.requestFullscreen()
						: e.mozRequestFullScreen
						? e.mozRequestFullScreen()
						: e.webkitRequestFullscreen
						? e.webkitRequestFullscreen()
						: e.msRequestFullscreen && e.msRequestFullscreen(),
				  window.scrollTo(0, 0))
				: document.exitFullscreen
				? document.exitFullscreen()
				: document.mozCancelFullScreen
				? document.mozCancelFullScreen()
				: document.webkitExitFullscreen
				? document.webkitExitFullscreen()
				: document.msExitFullscreen && document.msExitFullscreen();
		}),
			document.documentElement.addEventListener('fullscreenchange', function (e) {
				null === document.fullscreenElement
					? $('.enter-fullscreen').data('fullscreen', !1)
					: $('.enter-fullscreen').data('fullscreen', !0),
					$('html').toggleClass('is-fullscreen'),
					$('.enter-fullscreen .icon').toggleClass('uk-hidden');
			});
		var e = $('input#pspi').val();
		try {
			localStorage.setItem("PSPNotification['" + e + "'']", '0');
		} catch (e) {}
		$('.toggle-notif').on('click', function () {
			if (0 == $(this).data('notif')) {
				try {
					localStorage.setItem("PSPNotification['" + e + "'']", '1');
				} catch (e) {}
				$(this).data('notif', !0);
			} else {
				try {
					localStorage.setItem("PSPNotification['" + e + "'']", '0');
				} catch (e) {}
				$(this).data('notif', !1);
			}
			$('.toggle-notif .icon, .toggle-notif .label').toggleClass('uk-hidden');
		}),
			$('#login-form').submit(function (e) {
				$('.form-message').addClass('uk-hidden'),
					$('#login-form #password-input').val().length > 0
						? ($('.form-message').text(''),
						  $.ajax({
								type: 'POST',
								url: $(this).attr('action'),
								data: $(this).serialize(),
								dataType: 'json',
								cache: !1,
								success: function (e) {
									$('.form-message').text(e.message),
										!0 === e.success
											? ($('.form-message')
													.removeClass('uk-alert-danger')
													.addClass('uk-alert-success'),
											  window.location.replace(
													window.location.protocol +
														'//' +
														window.location.host +
														'/' +
														e.redirect
											  ))
											: $('.form-message')
													.removeClass('uk-alert-success')
													.addClass('uk-alert-danger'),
										$('.form-message').removeClass('uk-hidden'),
										$('.form-message').removeClass('uk-hidden');
								},
								error: function () {
									$('.form-message')
										.removeClass('uk-alert-success')
										.addClass('uk-alert-danger')
										.text('There was an unexpected error, please try again.');
								},
						  }))
						: ($('.form-message')
								.removeClass('uk-alert-success')
								.addClass('uk-alert-danger')
								.text('Password field must not be empty.'),
						  $('.form-message').removeClass('uk-hidden'),
						  $('.form-message').removeClass('uk-hidden')),
					e.preventDefault();
			}),
			UIkit.util.on('#subscribe-dropdown', 'show', function () {
				$('#subscribe-dropdown input').focus(),
					$('#subscribe-form .form-message')
						.text('')
						.addClass('uk-hidden')
						.removeClass('uk-alert-success uk-alert-danger'),
					$('#subscribe-form button').prop('disabled', !1),
					window.sendGAEvents &&
						gtag('event', 'UR_SP_subscribe_open', {
							event_category: 'UptimeRobot Status page',
							event_label: 'Open subscription dropdown',
						});
			}),
			1 != getCookie('ckConsent') && $('#ck-consent').removeClass('uk-hidden'),
			$('.hide-ckc').on('click', function () {
				$('#ck-consent').remove(), setCookie('ckConsent', 1, 7);
			}),
			$('#unsubscribe-form').on('submit', function (e) {
				e.preventDefault();
				var s = $('input#pspi').val(),
					t = $('#unsubscribe-form input[type="email"]').val();
				return (
					$('#unsubscribe-form .form-message')
						.text('')
						.addClass('uk-hidden')
						.removeClass('uk-alert-success uk-alert-danger'),
					$('#unsubscribe-form button').text('Processing...').prop('disabled', !0),
					$.ajax({
						type: 'POST',
						url: $('#unsubscribe-form').attr('action'),
						data: { email: t, pspUrlKey: s },
						dataType: 'json',
						cache: !1,
						success: function (e) {
							$('#unsubscribe-form button').text('Send unsubscribe link').prop('disabled', !1),
								1 == e.status
									? $('#unsubscribe-form .form-message')
											.html(
												'Unsubscribe link has been sent. <strong>Confirm the unsubscribe by clicking a link in the email, please.</strong>'
											)
											.removeClass('uk-hidden')
											.removeClass('uk-alert-danger')
											.addClass('uk-alert-success')
									: $('#unsubscribe-form .form-message')
											.text(e.message)
											.removeClass('uk-hidden')
											.addClass('uk-alert-danger'),
								window.sendGAEvents &&
									gtag('event', 'UR_SP_unsubscribe_sucessfull', {
										event_category: 'UptimeRobot Status page',
										event_label: 'Successfully unsubscribed with email',
									}),
								1 == window.sendGTM && dataLayer.push({ event: 'psp-unsubscribe-ok' });
						},
						error: function (e) {
							$('#unsubscribe-form button').text('Subscribe').prop('disabled', !1);
							var s = 'There was an error while unsubscribing. Try again, please.';
							'Subscription not found' == e.responseJSON.message
								? (s = 'Given email address is not suscribed to this status page.')
								: Rollbar.error('PSP email unsubscribe error', { error: e }),
								$('#unsubscribe-form .form-message')
									.text(s)
									.removeClass('uk-hidden')
									.addClass('uk-alert-danger');
						},
					}),
					!1
				);
			}),
			UIkit.util.on('#unsubscribe', 'show', function () {
				$('#unsubscribe-form .form-message')
					.text('')
					.addClass('uk-hidden')
					.removeClass('uk-alert-success uk-alert-danger');
			});
	}),
	$('#subscribe-form').on('submit', function (e) {
		e.preventDefault();
		var s = $('input#pspi').val(),
			t = $('#subscribe-form input[type="email"]').val();
		return (
			$('#subscribe-form .form-message')
				.text('')
				.addClass('uk-hidden')
				.removeClass('uk-alert-success uk-alert-danger uk-alert-primary'),
			$('#subscribe-form button').text('Processing...').prop('disabled', !0),
			$.ajax({
				type: 'POST',
				url: $('#subscribe-form').attr('action'),
				data: { email: t, pspUrlKey: s },
				dataType: 'json',
				cache: !1,
				success: function (e) {
					$('#subscribe-form button').text('Subscribe').prop('disabled', !1),
						'Subscription successful.' == e[0]
							? $('#subscribe-form .form-message')
									.html(
										'Success! Now check your inbox and <strong>confirm your subscription.</strong>'
									)
									.removeClass('uk-hidden')
									.addClass('uk-alert-success')
							: $('#subscribe-form .form-message')
									.text(e[0])
									.removeClass('uk-hidden')
									.addClass('uk-alert-danger'),
						window.sendGAEvents &&
							gtag('event', 'UR_SP_subscribe_sucessfull', {
								event_category: 'UptimeRobot Status page',
								event_label: 'Successfully subscribed with email',
							}),
						1 == window.sendGTM && dataLayer.push({ event: 'psp-subscribe-ok' });
				},
				error: function (e) {
					$('#subscribe-form button').text('Subscribe').prop('disabled', !1),
						409 == e.status
							? $('#subscribe-form .form-message')
									.text(e.responseJSON[0])
									.removeClass('uk-hidden')
									.addClass('uk-alert-primary')
							: ($('#subscribe-form .form-message')
									.text('There was an error while subscribing. Try again, please.')
									.removeClass('uk-hidden')
									.addClass('uk-alert-danger'),
							  Rollbar.error('PSP email subscribe error', { error: e }));
				},
			}),
			!1
		);
	});
//# sourceMappingURL=common.min.js.map
