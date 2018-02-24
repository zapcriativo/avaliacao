﻿import {_alert, _confirm} from '../../functions/message';
import {moneyPtBR} from "../../functions/money";
import {ExibirDicadeFrete} from "./mini_cart";
import {SomenteNumerosPositivos} from "../../functions/form-control";
import {disparaAjaxUpdate}  from "./mini_cart";

function InserirQuantidadeManual(){
  $(document).on("keyup", "#ListProductsCheckoutCompleto input[id^='qtd_']", function (e) {
      CancelarCalculoFreteCart(1);
      var valor_final = SomenteNumerosPositivos($(this).val());
      $(this).val(valor_final);
      $("#id_frete_selecionado").val("");
      $("#cep_selecionado").val("");
      // $("#btn_recalcular_frete").click();

      var action = $(this).attr("data-action");
      var idCurrent = $(this).attr("data-id");
      var valorInput = new Number($("#qtd_"+idCurrent).val());
      var valorStock = new Number($("#stock_"+idCurrent).val());

      if(valorInput <= valorStock){
          disparaAjaxUpdate(idCurrent, valorInput, action);
      }
      else{
          _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
          valorInput -= 1
      }

      $("#qtd_"+idCurrent).val(valorInput);
      e.stopPropagation();
  });
}

function AddMinusProductCart(){
    $(".qtdAction").on("click", function(event){
        CancelarCalculoFreteCart(1);
        var action = $(this).attr("data-action");
        var idCurrent = $(this).attr("data-id");
        var valorInput = new Number($("#qtd_"+idCurrent).val());
        var valorStock = new Number($("#stock_"+idCurrent).val());

        if(action == "plus"){
            valorInput += 1;
            if(valorInput <= valorStock){
                disparaAjaxUpdate(idCurrent, valorInput, action);
            }
            else{
                _alert("Ops ... Encontramos um problema", "Produto sem Estoque!", "warning");
                valorInput -= 1
            }
        }
        else{
            valorInput -= 1;
            if(valorInput <= 0){
                valorInput = 1;
            }
            else{
                disparaAjaxUpdate(idCurrent, valorInput, action);
            }
        }
        $("#qtd_"+idCurrent).val(valorInput);

        var id_frete = $("#id_frete_selecionado").val();
        var cep_selecionado = $("#cep_selecionado").val();
        ExibirDicadeFrete(id_frete,cep_selecionado);
        //$('.qtdAction').off('click');

    });
}

function RemoveProductCart(){
    $(".removeCartItem").click(function(event){
        var idCurrent = $(this).attr("data-id");
        _confirm({
            title: "Deseja realmente remover esse produto do carrinho?",
            text: "",
            type: "warning",
            confirm:{
                text: "Remover"
            },
            cancel:{
                text:"Cancelar"
            },
            callback: function(){
                $.ajax({
                    method: "POST",
                    url: "/Checkout/DeleteProduct",
                    data:{
                        idCartItem : new Number(idCurrent)
                    },
                    success: function(data){
                        if(data.success == true){
                            $("#itemCartProduct_"+idCurrent).remove();
                            LoadCarrinho();
                        }
                    }
                });
            }
        });
    });
}

function LoadServiceShipping(){
    $("#CallServiceShipping").click(function(event){
        $(this).addClass("loading");
        var zipCode = $(this).prev('input').inputmask('unmaskedvalue');
        $.ajax({
            method: "POST",
            url: "/Checkout/GetShippingValues",
            data:{ zipCode: zipCode},
            success: function(data){
                $("#CallServiceShipping").removeClass("loading");
                $(".description.frete").hide();
                //Coloca as infoam��es no Bloco HMTL com os valores corretos
                $(".description.resultado .valor").html(data);
                //$(".tabela.frete").dropdown('refresh');
                $(".description.resultado").show();

                ChangeFrete();
                var idCurrent = $("#GetShipping").val();
                var zipCode = $("#shipping").inputmask('unmaskedvalue');
                var idShippingMode = idCurrent;
                var deliveredByTheCorreiosService = $("#ship_"+idCurrent).attr("data-correios");


                $("#id_frete_selecionado").val(idShippingMode);
                $("#cep_selecionado").val(zipCode);
                ExibirDicadeFrete(idShippingMode, zipCode);
                SaveFrete(zipCode, idShippingMode, deliveredByTheCorreiosService);
            }
        });
        event.stopPropagation();
    });
}

function ClearCart(){
    $("#ClearCart").on("click", function(event){
        _confirm({
            title: "Deseja realmente remover todos os produtos do carrinho?",
            text: "",
            type: "warning",
            confirm:{
                text: "Remover"
            },
            cancel:{
                text:"Cancelar"
            },
            callback: function(){
                $.ajax({
                    method: "POST",
                    url: "/Checkout/ClearCart",
                    success: function(data){
                        window.location.href = "/home";
                    }
                });
            }
        });
    });
}

function LoadCarrinho(){
    $.ajax({
        method: "GET",
        url: "/Checkout/LoadPartialCart",
        contentType: "application/json; charset=utf-8",
        success: function(response){
            var objCarrinho;
            if(response.success == true){
                objCarrinho = jQuery.parseJSON(response.cartJson);

                for (var i = 0; i < objCarrinho.cartItems.length; i++) {
                    var idCartItem = objCarrinho.cartItems[i].idCartItem;
                    var precoTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.cartItems[i].priceTotalProduct);
                    var precoUnt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.cartItems[i].priceProduct);

                    $("#preco_total_"+idCartItem).text(precoTotal);
                    $("#preco_unitario_"+idCartItem).text(precoUnt);
                }

                var descontoCarrinho = objCarrinho.totalDiscount;
                var subTotalCarrinho = objCarrinho.subTotal;
                var totalCarrinho = objCarrinho.total;

                UpdateCabecalhoCarrinho(descontoCarrinho, subTotalCarrinho, totalCarrinho);
            }
            else{
                _alert("Ops ... Seu carrinho agora está vazio!", "Estamos te direcionando para a Home!", "warning");
                window.location.href = "/Home";
            }
        }
    });
}

function UpdateCabecalhoCarrinho(descontoCarrinho, subTotalCarrinho, totalCarrinho){
    descontoCarrinho = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(descontoCarrinho);
    subTotalCarrinho = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subTotalCarrinho);
    totalCarrinho = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCarrinho);

    $("#descontoCarrinho").text(descontoCarrinho);
    $("#subTotalCarrinho").text(subTotalCarrinho);
    $("#totalCarrinho").text(totalCarrinho);
}

function SaveFrete(zipCode, idShippingMode, deliveredByTheCorreiosService){
    $.ajax({
        method: "POST",
        url: "/Checkout/SaveFrete",
        data:{
            zipCode                         : zipCode,
            idShippingMode                  : idShippingMode,
            deliveredByTheCorreiosService   : deliveredByTheCorreiosService
        },
        success: function(data){
            LoadCarrinho();
        }
    });
}

function ChangeFrete(){
    $("#GetShipping").change(function(){
        var ponteiroCurrent = $(this);
        var idCurrent = $(ponteiroCurrent).val();

        var zipCode = $("#shipping").inputmask('unmaskedvalue');
        var idShippingMode = idCurrent;
        var deliveredByTheCorreiosService = $("#ship_"+idCurrent).attr("data-correios");
        SaveFrete(zipCode, idShippingMode, deliveredByTheCorreiosService);
        ExibirDicadeFrete(idShippingMode, zipCode);
    });
}

function LoadServiceShippingStart(){
    $.ajax({
        method: "POST",
        url: "/Checkout/GetShippingValues",
        data:{ zipCode: zipCode},
        success: function(data){
            $("#CallServiceShipping").removeClass("loading");
            $(".description.frete").hide();
            //Coloca as infoam��es no Bloco HMTL com os valores corretos
            $(".description.resultado .valor").html(data);
            //$(".tabela.frete").dropdown('refresh');
            $(".description.resultado").show();

            ChangeFrete();
            var idCurrent = $("#GetShipping").val();
            var zipCode = $("#shipping").inputmask('unmaskedvalue');
            var idShippingMode = idCurrent;
            var deliveredByTheCorreiosService = $("#ship_"+idCurrent).attr("data-correios");


            $("#id_frete_selecionado").val(idShippingMode);
            $("#cep_selecionado").val(zipCode);

            ExibirDicadeFrete(idShippingMode, zipCode);

            SaveFrete(zipCode, idShippingMode, deliveredByTheCorreiosService);
        }
    });
    event.stopPropagation();
}

function CancelarCalculoFreteCart(flagUpdate){
  var existeCep = $("#cep_selecionado").val();
  if(existeCep != ""){
    $("#id_frete_selecionado").val("");
    $("#cep_selecionado").val("");
    $(".description.frete").css("display", "block");
    $(".description.resultado").css("display", "none");
        $.ajax({
            method: "POST",
            url: "/Checkout/CancelarCalculoFrete",
            data: {},
            success: function(data){
                if(data.success === false){
                    console.log("Erro ao excluir frete");
                }
                if(flagUpdate === 1){
                  UpdateCarrinho();
                }
            },
            onFailure: function(data){
                console.log("Erro ao excluir frete");
            }
        });
    }
}

function CancelarCalculoFreteClk(){
  $(document).on("click", "#ListProductsCheckoutCompleto #btn_recalcular_frete", function(event) {
      CancelarCalculoFreteCart(1);
  });
}

$(document).ready(function () {
    AddMinusProductCart();
    RemoveProductCart();
    LoadServiceShipping();
    ClearCart();
    InserirQuantidadeManual();
    CancelarCalculoFreteClk();
})

$(document).on("click", "#finalizePurchase", function(e){        
    $.ajax({
        method: "GET",
        url: "/Checkout/CheckoutNext",
        data: {},
        success: function(data){
            if(data.success === true)
               window.location.href = data.redirect
            else
                _alert("Mensagem", data.message, "error")                
        },
        onFailure: function(data){
            console.log("Erro ao excluir frete");
        }
    })
})