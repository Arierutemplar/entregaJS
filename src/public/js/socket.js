(() => {
  const socket = io();

  const escapeHtml = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  socket.on('service:created', service => {
    const list = document.querySelector('#services-list');
    if (!list || document.querySelector(`[data-service-id="${service._id}"]`)) return;

    document.querySelector('#empty-services')?.remove();
    const card = document.createElement('article');
    card.className = 'card service-card';
    card.dataset.serviceId = service._id;
    card.innerHTML = `
      <div class="card-topline">
        <span class="tag">${escapeHtml(service.category)}</span>
        <span class="availability ${service.available ? 'is-available' : 'is-unavailable'}">
          ${service.available ? 'Disponible' : 'No disponible'}
        </span>
      </div>
      <h2>${escapeHtml(service.name)}</h2>
      <p>${escapeHtml(service.description)}</p>
      <dl class="details">
        <div><dt>Duración</dt><dd>${escapeHtml(service.duration)} min</dd></div>
        <div><dt>Precio</dt><dd>$${escapeHtml(service.price)}</dd></div>
      </dl>`;
    list.prepend(card);
  });

  socket.on('booking:updated', booking => {
    const list = document.querySelector('#bookings-list');
    if (!list) return;

    const servicesMarkup = booking.services?.length
      ? `<ul class="service-items">${booking.services.map(item => `
          <li><span>${escapeHtml(item.service?.name || item.service)}</span>
          <strong>× ${escapeHtml(item.quantity)}</strong></li>`).join('')}</ul>`
      : '<p class="muted">Sin servicios asociados.</p>';
    const existingCard = document.querySelector(`[data-booking-id="${booking._id}"]`);
    const confirmMarkup = booking.status === 'confirmada' ? '' : `
      <button type="button" class="btn confirm-booking-btn" data-booking-id="${escapeHtml(booking._id)}">Confirmar reserva</button>`;

    if (existingCard) {
      existingCard.innerHTML = `
        <div class="card-topline">
          <span class="tag">${escapeHtml(booking.status)}</span>
          <time>${escapeHtml(booking.date)} · ${escapeHtml(booking.time)}</time>
        </div>
        <h2>${escapeHtml(booking.clientName)}</h2>
        <p>${escapeHtml(booking.clientEmail)}</p>
        <h3>Servicios</h3>${servicesMarkup}${confirmMarkup}`;
      return;
    }

    document.querySelector('#empty-bookings')?.remove();
    const card = document.createElement('article');
    card.className = 'card booking-card';
    card.dataset.bookingId = booking._id;
    card.innerHTML = `
      <div class="card-topline">
        <span class="tag">${escapeHtml(booking.status)}</span>
        <time>${escapeHtml(booking.date)} · ${escapeHtml(booking.time)}</time>
      </div>
      <h2>${escapeHtml(booking.clientName)}</h2>
      <p>${escapeHtml(booking.clientEmail)}</p>
      <h3>Servicios</h3>${servicesMarkup}${confirmMarkup}`;
    list.prepend(card);
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('.confirm-booking-btn');
    if (!button) return;

    button.disabled = true;
    socket.emit('client:confirm-booking', { bookingId: button.dataset.bookingId }, response => {
      if (response?.status !== 'success') button.disabled = false;
    });
  });

  socket.on('booking:error', ({ message }) => {
    alert(message);
  });
})();
