import { Page, chromium } from 'playwright';

const nextButtonId = '#NextButton';
const bkNumberInputId = '#QR\\~QID4';
const dateInputId = '#QR\\~QID118\\~2';
const datePickerId = '.ui-state-highlight';

const hourInputId = '#QR\\~QID8\\#1\\~1';
const minuteInputId = '#QR\\~QID8\\#2\\~1';
const amOrPmInputId = '#QR\\~QID8\\#3\\~1';

const questionsContainerId = "#Questions";

export default defineEventHandler(async (event) => {
    try {
        const inputValue = getQuery(event).bk;
        
        if (inputValue === undefined || inputValue === null || inputValue.toString().trim() === '') {
            console.error('BkId is null, undefined or empty.');
            throw createError({ statusCode: 500, statusMessage: 'Null, undefined or empty bk id.' });
        }

        const completionCode = await completeSurvey(inputValue.toString());
        return { code: completionCode };
    } catch (error) {
        console.error('Error completing the survey:', error);
        throw createError({ statusCode: 500, statusMessage: 'An error occurred while completing the survey.' });
    }
});

async function goNextPage(page: Page): Promise<void> {
    await (await page.waitForSelector(nextButtonId)).click();
    await page.waitForLoadState('networkidle');
}

const completeSurvey = async (bkId: string) => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        await page.goto('https://minhabkexperiencia.com/', {waitUntil: 'load'});
        await page.waitForSelector('iframe');
        const realLink = (await page.getAttribute('iframe', 'src'))!;
        await page.goto(realLink, {waitUntil: 'load'});
        await page.waitForLoadState('networkidle');

        await page.fill(bkNumberInputId, bkId, {timeout: 3000});
        await goNextPage(page);

        await page.click(dateInputId, {timeout: 2000, force: true});
        await page.click(datePickerId, {timeout: 2000, force: true});
        
        let hour = new Date().getHours() % 12;
        if (hour === 0) {
            hour = 12;
        }
        const minute = new Date().getMinutes();
        const isAm = new Date().getHours() < 12 ? 1 : 2;

        await page.selectOption(hourInputId, {value: hour.toString()});
        await page.selectOption(minuteInputId, {value: minute.toString()});
        await page.selectOption(amOrPmInputId, {value: isAm.toString()});
        
        await page.waitForTimeout(2000);
        await goNextPage(page);

        await page.waitForSelector(questionsContainerId);
        const questions = await page.$$(questionsContainerId);
        console.log(questions.length);
        await page.waitForTimeout(5000);

        //await page.fill('#input-field-id', 'Answer to question');
        //await page.click('#submit-button-id');
        //await page.waitForSelector('#completion-code-id');
        //const completionCode = await page.textContent('#completion-code-id');
        await browser.close();
        return "bruh";
    } catch (error) {
        await browser.close();
        throw error;
    }
};  