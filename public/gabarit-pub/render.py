"""
Filme index.html et sort un MP4.

    python render.py pub.mp4 0 15

Installation, une seule fois :
    pip install playwright && playwright install chromium
    (et ffmpeg, via brew install ffmpeg ou apt install ffmpeg)

Les deux réglages qui comptent sont commentés plus bas.
DKM Learning Hub · https://dkm-learning-hub.vercel.app/resources/pub-motion
"""
import asyncio, os, subprocess, sys
from playwright.async_api import async_playwright

FPS = 30
WIDTH, HEIGHT = 1080, 1920


async def main(out, t0, t1):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': WIDTH, 'height': HEIGHT})
        await page.goto('file://' + os.path.abspath('index.html'))

        # RÉGLAGE 1 : attendre que les polices soient chargées.
        # Sans cette ligne, les premières images sortent dans la mauvaise police.
        # Tu ne le vois jamais en ouvrant la page à la main, parce qu'à ce
        # moment-là tout est déjà chargé.
        await page.evaluate('document.fonts.ready')

        ff = subprocess.Popen([
            'ffmpeg', '-y', '-v', 'error',
            '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
            # Les images arrivent en JPEG, donc en plage de couleur pleine.
            # Sans cette conversion, ffmpeg sort du yuvj420p et ignore le
            # réglage suivant. C'est le piège : la ligne a l'air appliquée.
            '-vf', 'scale=in_range=full:out_range=tv',
            '-c:v', 'libx264',
            # RÉGLAGE 2 : sans -pix_fmt yuv420p, la vidéo se lit sur ton
            # ordinateur et nulle part ailleurs. Meta et iPhone la refusent.
            '-pix_fmt', 'yuv420p',
            '-crf', '18', '-preset', 'medium',
            out,
        ], stdin=subprocess.PIPE)

        n0, n1 = int(t0 * FPS), int(t1 * FPS)
        for i in range(n0, n1):
            await page.evaluate(f'render({i / FPS})')
            ff.stdin.write(await page.screenshot(type='jpeg', quality=92))
            if (i - n0) % FPS == 0:
                done = (i - n0) / max(1, n1 - n0)
                print(f'\r{done:.0%}', end='', flush=True)

        ff.stdin.close()
        ff.wait()
        await browser.close()
        print(f'\r100%  {out}')


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'pub.mp4'
    t0 = float(sys.argv[2]) if len(sys.argv) > 2 else 0
    t1 = float(sys.argv[3]) if len(sys.argv) > 3 else 15
    asyncio.run(main(out, t0, t1))
