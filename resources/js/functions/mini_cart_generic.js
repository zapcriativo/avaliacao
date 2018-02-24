﻿import {_alert, _confirm} from "./message";
import {ExibirDicadeFrete} from "../api/checkout/mini_cart";
import {RecalcularFrete} from "../api/checkout/mini_cart";
﻿import {isLoading} from "../api/api_config";


export function LoadCarrinho(showSidebar = false){
  console.log("Carregar Carrinho");
    $.ajax({
        method: "GET",
        url: "/Checkout/LoadProductsMiniCart",
        success: function(loadProduct){
            var retornoAjax      = loadProduct.split("|$|");
            var listaProdutos    = retornoAjax[0];
            $("#ListProductsCheckout").html(listaProdutos);
            UpdateCarrinho(showSidebar);
        },
        error : function(request,error)
        {
            console.log(request);
        }
    });
}

export function UpdateCarrinho(showSidebar) {
    console.log("passando no update carrinho");
    isLoading("#miniCarrinho");
    $.ajax({
        method: "GET",
        url: "/Checkout/LoadPartialCart",
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            var objCarrinho;
            if (response.success == true) {
                objCarrinho = jQuery.parseJSON(response.cartJson);

                for (var i = 0; i < objCarrinho.cartItems.length; i++) {
                    var idCartItem = objCarrinho.cartItems[i].idCartItem;
                    var precoTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.cartItems[i].priceTotalProduct);
                    var precoUnt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.cartItems[i].priceProduct);
                    var quantidade = objCarrinho.cartItems[i].quantity;


                    if(objCarrinho.cartItems[i].flagExhausted === 0 || objCarrinho.cartItems[i].stock === 0){
                        $("#availability_"+idCartItem).text("Produto Esgotado");
                        $("#itemCartProduct_"+idCartItem).addClass("exhausted");
                    }


                    $("#preco_total_" + idCartItem).text(precoTotal);
                    $("#preco_unitario_" + idCartItem).text(precoUnt);
                    $("#qtd_" +idCartItem).val(quantidade);

                }


                var TotalDesconto = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.totalDiscount);
                var SubTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.subTotal);
                var TotalFinal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objCarrinho.total);

                var descontoCarrinho = TotalDesconto;
                var subTotalCarrinho = SubTotal;
                var totalCarrinho = TotalFinal;

                UpdateCabecalhoCarrinho(descontoCarrinho, subTotalCarrinho, totalCarrinho);
                updateQuantidadeTopoCarrinho();

                //RecalcularFrete(cep_selecionado);
                var id_frete = $("#id_frete_selecionado").val();
                var cep_selecionado = $("#cep_selecionado").val();
                //$("#btn_recalcular_frete").click();
                ExibirDicadeFrete(id_frete,cep_selecionado);

                $("#id_frete_selecionado").val(response.freteID);
                $("#cep_selecionado").val(response.cep);

                $(".buttonsMiniCart").each(function(){
                    $(this).attr("disabled", false)
                })
            }
            else {
                //_alert("Ops ... Seu carrinho agora está vazio!", "Estamos te direcionando para a Home!", "warning");
                //window.location.href = "/Home";
                $("#totalCarrinho").text("");
                $("#subTotalCarrinho").text("");
                updateQuantidadeTopoCarrinho();
                $(".buttonsMiniCart").each(function(){
                    $(this).attr("disabled", true)
                })

            }
              $(".qtdActionMiniCart").on("click");
              isLoading("#miniCarrinho");
              if(showSidebar == true){
                $(".carrinho").sidebar('toggle');
              }
        },
        onFailure: function(response){
              $(".qtdActionMiniCart").on("click");
              console.log("Erro ao atualizar carrinho");
              isLoading("#miniCarrinho");
        }
    });
}

function UpdateCabecalhoCarrinho(descontoCarrinho, subTotalCarrinho, totalCarrinho) {
    $("#descontoCarrinho").text(descontoCarrinho);
    $("#subTotalCarrinho").text(subTotalCarrinho);
    $("#totalCarrinho").text(totalCarrinho);
}


export function LoadCarrinhoEventList(showSidebar = false){
  isLoading("#miniCarrinho");
  $.ajax({
      method: "GET",
      url: "/EventList/LoadProductsEventListMiniCart",
      success: function(loadProduct){
          var retornoAjax      = loadProduct.split("|$|");
          var listaProdutos    = retornoAjax[0];

          $("#ListProductsCheckout").html(listaProdutos);
          updateQuantidadeTopoCarrinho();
          $(".qtdActionEventList").on("click");
          if(showSidebar === true){
              $(".carrinho").sidebar('toggle');
          }
          isLoading("#miniCarrinho");

      },
      error : function(request,error)
      {
          console.log(request);
          isLoading("#miniCarrinho");

      }
  });
}
