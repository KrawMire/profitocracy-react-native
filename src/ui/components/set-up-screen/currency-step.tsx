import { Button, IndexPath, Layout, Select, SelectItem, Text } from "@ui-kitten/components";
import { currencyStepStyle } from "styles/components/set-up-screen/currency-step.style";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CurrencyService } from "services/currency-service";
import { availableCurrencies } from "utils/currency/available-currencies";
import Loading from "components/shared/loading";
import { setCurrencyRates } from "state/currency-rates/actions";
import { setMainCurrency } from "state/settings/actions";
import { AppState } from "state/app-state";

export interface CurrencyStepProps {
  onMoveNext: () => void;
  onMoveBack: () => void;
}

export function CurrencyStep(props: CurrencyStepProps) {
  const dispatch = useDispatch();

  const currencyRates = useSelector((state: AppState) => state.currencyRates);

  const [baseCurrencyIndex, setBaseCurrencyIndex] = useState<IndexPath>(new IndexPath(0));
  const [currenciesLoaded, setCurrencyLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  const baseCurrency = availableCurrencies[baseCurrencyIndex.row];

  useEffect(() => loadCurrencies(), [baseCurrencyIndex]);

  const loadCurrencies = () => {
    setCurrencyLoaded(false);

    CurrencyService.getCurrencyRates(baseCurrency.code)
      .then((currencies) => {
        dispatch(setCurrencyRates(currencies));
        setCurrencyLoaded(true);
        setLoadingError(false);
      })
      .catch(() => {
        setLoadingError(true);
      });
  };

  const onLoadCurrenciesClick = () => {
    setCurrencyLoaded(false);
    setLoadingError(false);
    loadCurrencies();
  };

  const onMoveBackClick = () => {
    props.onMoveBack();
  };

  const onMoveNextClick = () => {
    dispatch(setMainCurrency(baseCurrency));
    props.onMoveNext();
  };

  return (
    <Layout>
      {currenciesLoaded ? (
        <Select
          label="Main currency"
          value={baseCurrency.name}
          onSelect={(index) => setBaseCurrencyIndex(index as IndexPath)}
          style={currencyStepStyle.selectCurrency}
        >
          {currenciesLoaded ? (
            availableCurrencies.map((currency) => <SelectItem key={currency.code} title={currency.name} />)
          ) : (
            <SelectItem title={baseCurrency.name} />
          )}
        </Select>
      ) : (
        <Loading />
      )}
      {loadingError && (
        <Layout>
          <Text>There was an error while trying to get currency rates. Try again</Text>
          <Button onPress={onLoadCurrenciesClick}>Load currencies rates</Button>
        </Layout>
      )}
      {currencyRates.map((rate) => (
        <Text key={rate.currency.code}>
          {rate.currency.code}: {rate.rate}
        </Text>
      ))}
      <Layout style={currencyStepStyle.moveButtonsContainer}>
        <Button style={currencyStepStyle.moveButton} onPress={onMoveBackClick}>
          Back
        </Button>
        <Button style={currencyStepStyle.moveButton} onPress={onMoveNextClick}>
          Next
        </Button>
      </Layout>
    </Layout>
  );
}
