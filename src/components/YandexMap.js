import React, { useRef, useEffect, useState } from 'react';

function YandexMap() {
    const mapRef = useRef(null);
    const mapInstance = useRef(null); // Для хранения экземпляра карты
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Проверяем, загружен ли уже API Яндекс.Карт
        if (window.ymaps) {
            initMap();
            return;
        }

        // Загружаем скрипт API Яндекс.Карт
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.async = true;

        script.onload = () => {
            window.ymaps.ready(() => {
                // Проверяем, что компонент еще смонтирован
                if (mapRef.current) {
                    initMap();
                }
            });
        };

        script.onerror = () => {
            setError('Не удалось загрузить API Яндекс.Карт');
            setLoading(false);
        };

        document.body.appendChild(script);

        function initMap() {
            try {
                // Очищаем предыдущую карту, если она существует
                if (mapInstance.current) {
                    mapInstance.current.destroy();
                    mapInstance.current = null;
                }

                // Создаем новую карту
                mapInstance.current = new window.ymaps.Map(mapRef.current, {
                    center: [55.644142, 37.674362],
                    zoom: 16,
                    controls: ['zoomControl', 'fullscreenControl']
                });

                // Добавляем метку
                const placemark = new window.ymaps.Placemark(
                    [55.644142, 37.674362],
                    {
                        balloonContent: `
                        <div style="font-family: 'Open Sans', sans-serif;">
                        <h3 style="margin: 0 0 8px; color: #0a2240;">«Национальный исследовательский ядерный университет МИФИ, учебно-лабораторный корпус»</h3>
                        <p style="margin: 0 0 8px;">Актовый зал, 5 этаж</p>
                        <p style="margin: 0;">г. Москва, Каширское шоссе, 64, корп. 1А</p>
                        </div>
                        `
                    },
                    {
                        iconColor: '#8d1f2c',
                        preset: 'islands#redDotIcon'
                    }
                );

                mapInstance.current.geoObjects.add(placemark);
                setLoading(false);
            } catch (err) {
                setError('Ошибка при инициализации карты: ' + err.message);
                setLoading(false);
            }
        }

        return () => {
            // Очистка при размонтировании компонента
            if (mapInstance.current) {
                mapInstance.current.destroy();
                mapInstance.current = null;
            }

            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    return (
        <div className="yandex-map" style={{ width: '100%', height: '400px', position: 'relative' }}>
        {loading && (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f0e5',
                zIndex: 1
            }}>
            Загрузка карты...
            </div>
        )}
        {error && (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffebee',
                color: '#d32f2f',
                padding: '1rem',
                textAlign: 'center',
                zIndex: 1
            }}>
            {error}
            </div>
        )}
        <div
        ref={mapRef}
        style={{
            width: '100%',
            height: '100%',
            opacity: loading || error ? 0.5 : 1,
            transition: 'opacity 0.3s ease'
        }}
        />
        </div>
    );
}

export default YandexMap;
